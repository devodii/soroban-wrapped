import logging
from collections import defaultdict
from datetime import date
from pathlib import Path

import duckdb
from stellar_sdk import StrKey

from soroban_wrapped.database import open_pool
from soroban_wrapped.sql_loader import load_sql

log = logging.getLogger("soroban_wrapped")

BATCH = 5000
MIN_FULL_DAY = 16000


def contract_id(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return StrKey.encode_contract(bytes.fromhex(value))
    except ValueError:
        return None


def rows(path: Path, query: str) -> list[tuple]:
    return duckdb.connect().execute(query.replace("{file}", str(path))).fetchall()


async def import_day(pool, network: str, directory: Path, day: date) -> tuple[int, int]:
    activity = directory / f"activity-{day}.parquet"
    functions = directory / f"functions-{day}.parquet"
    edges = directory / f"edges-{day}.parquet"
    network_file = directory / f"network-{day}.parquet"
    by_callee: dict[str, dict[str, int]] = defaultdict(dict)
    for callee, fn, calls in rows(
        functions, "SELECT callee, fn, calls FROM read_parquet('{file}')"
    ):
        by_callee[callee][fn or ""] = calls
    activity_rows = []
    for callee, calls, successful, accounts in rows(
        activity,
        "SELECT callee, calls, successful, accounts FROM read_parquet('{file}')",
    ):
        cid = contract_id(callee)
        if cid:
            activity_rows.append(
                (network, cid, day, calls, successful, accounts, by_callee[callee])
            )
    grouped: dict[tuple[str, str], list] = {}
    for caller, callee, fn, calls, successful in rows(
        edges,
        "SELECT caller, callee, fn, calls, successful FROM read_parquet('{file}')",
    ):
        callee_id = contract_id(callee)
        if callee_id and caller:
            entry = grouped.setdefault((caller, callee_id), [0, 0, {}])
            entry[0] += calls
            entry[1] += successful
            entry[2][fn or ""] = entry[2].get(fn or "", 0) + calls
    edge_rows = [
        (network, caller, callee, day, calls, successful, fns)
        for (caller, callee), (calls, successful, fns) in grouped.items()
    ]
    totals = rows(
        network_file,
        "SELECT ledgers, transactions, failed_transactions, operations, "
        "contract_calls, contracts_called FROM read_parquet('{file}')",
    )
    if not totals or totals[0][0] < MIN_FULL_DAY:
        log.warning(
            "%s has only %s ledgers, a partial day, not imported",
            day,
            totals[0][0] if totals else 0,
        )
        return 0, 0
    async with pool.acquire() as connection, connection.transaction():
        for offset in range(0, len(activity_rows), BATCH):
            await connection.executemany(
                load_sql("upsert_activity"), activity_rows[offset : offset + BATCH]
            )
        for offset in range(0, len(edge_rows), BATCH):
            await connection.executemany(
                load_sql("upsert_edge"), edge_rows[offset : offset + BATCH]
            )
        for row in totals:
            await connection.execute(load_sql("upsert_network_day"), network, day, *row)
            await connection.execute(
                load_sql("upsert_chain_day"), network, day, row[0], row[4]
            )
    return len(activity_rows), len(edge_rows)


async def import_directory(pool, directory: Path, network: str) -> int:
    days = sorted(
        {
            date.fromisoformat(f.stem.removeprefix("network-"))
            for f in directory.rglob("network-*.parquet")
        }
    )
    for day in days:
        folder = next(directory.rglob(f"network-{day}.parquet")).parent
        contracts, edges = await import_day(pool, network, folder, day)
        log.info("%s: %s contract-days, %s call edges imported", day, contracts, edges)
    return len(days)


async def run_import(directory: str, network: str) -> None:
    pool = await open_pool()
    try:
        await import_directory(pool, Path(directory), network)
    finally:
        await pool.close()
