import asyncio
import logging
import time
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse

from soroban_wrapped.api_models import (
    Concentration,
    Contract,
    Day,
    DayRecord,
    GraphTotals,
    Month,
    ParetoPoint,
    SdkVersion,
    SizeBucket,
    Totals,
    WasmStats,
    Weekday,
    Wrapped,
)
from soroban_wrapped.config import ROOT
from soroban_wrapped.database import open_pool
from soroban_wrapped.sql_loader import load_sql

log = logging.getLogger("soroban_wrapped")

WEB_DIST = ROOT / "web" / "dist"
TTL_SECONDS = 600
TOP_CONTRACTS = 10
PARETO_AT = [1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 50000]
TOP_SDKS = 10
MIN_FAILURE_DAY_TRANSACTIONS = 1_000_000
NETWORKS = ("mainnet", "testnet")


def records(days: list[Day]) -> list[DayRecord]:
    full = [d for d in days if not d.partial]
    if not full:
        return []
    rate = [d for d in full if d.transactions >= MIN_FAILURE_DAY_TRANSACTIONS] or full
    jumps = [
        (b, b.contract_calls - a.contract_calls)
        for a, b in zip(full, full[1:], strict=False)
    ]
    busiest = max(full, key=lambda d: d.contract_calls)
    chatty = max(full, key=lambda d: d.transactions)
    worst = max(rate, key=lambda d: d.failed_transactions / max(d.transactions, 1))
    best = min(rate, key=lambda d: d.failed_transactions / max(d.transactions, 1))
    quiet = min(full, key=lambda d: d.contract_calls)
    jump_day, jump = max(jumps, key=lambda pair: pair[1]) if jumps else (busiest, 0)
    return [
        DayRecord(kind="most_calls", day=busiest.day, value=busiest.contract_calls),
        DayRecord(kind="most_transactions", day=chatty.day, value=chatty.transactions),
        DayRecord(
            kind="highest_failure_rate",
            day=worst.day,
            value=100 * worst.failed_transactions / max(worst.transactions, 1),
        ),
        DayRecord(
            kind="lowest_failure_rate",
            day=best.day,
            value=100 * best.failed_transactions / max(best.transactions, 1),
        ),
        DayRecord(kind="biggest_jump", day=jump_day.day, value=jump),
        DayRecord(kind="quietest", day=quiet.day, value=quiet.contract_calls),
    ]


async def build(pool, network: str) -> Wrapped:
    async def many(name: str, *args):
        async with pool.acquire() as connection:
            return [dict(r) for r in await connection.fetch(load_sql(name), *args)]

    async def one(name: str, *args):
        rows = await many(name, *args)
        return rows[0]

    (
        totals,
        days,
        months,
        weekdays,
        top,
        concentration,
        graph_totals,
        pareto,
        sdks,
        wasm,
        sizes,
    ) = await asyncio.gather(
        one("stats_totals", network),
        many("stats_days", network),
        many("stats_months", network),
        many("stats_weekdays", network),
        many("stats_top_contracts", network, TOP_CONTRACTS),
        one("stats_concentration", network),
        one("stats_graph_totals", network),
        many("stats_pareto", network, PARETO_AT),
        many("stats_sdk_versions", network, TOP_SDKS),
        one("stats_wasm", network),
        many("stats_wasm_sizes", network),
    )
    day_models = [
        Day(
            **{k: v for k, v in d.items() if k != "status"},
            partial=d["status"] != "done",
        )
        for d in days
    ]
    return Wrapped(
        network=network,
        generated_at=datetime.now(UTC),
        totals=Totals(
            **{k: v for k, v in totals.items() if k != "edge_days"},
            call_pairs=graph_totals["pairs"],
        ),
        days=day_models,
        months=[Month(**m) for m in months],
        weekdays=[Weekday(**w) for w in weekdays],
        records=records(day_models),
        top_contracts=[Contract(**c) for c in top],
        concentration=Concentration(**concentration),
        graph_totals=GraphTotals(**graph_totals),
        pareto=[ParetoPoint(**p) for p in pareto],
        sdk_versions=[SdkVersion(**s) for s in sdks],
        wasm=WasmStats(**wasm),
        wasm_sizes=[SizeBucket(**b) for b in sizes],
    )


class Snapshots:
    def __init__(self) -> None:
        self.pool = None
        self.items: dict[str, tuple[float, Wrapped]] = {}
        self.locks = {name: asyncio.Lock() for name in NETWORKS}

    async def get(self, network: str) -> Wrapped:
        async with self.locks[network]:
            saved = self.items.get(network)
            if saved and time.monotonic() - saved[0] < TTL_SECONDS:
                return saved[1]
            fresh = await build(self.pool, network)
            self.items[network] = (time.monotonic(), fresh)
            return fresh

    async def keep_fresh(self) -> None:
        while True:
            for network in NETWORKS:
                try:
                    await self.get(network)
                except Exception:
                    log.exception("could not refresh the %s snapshot", network)
            await asyncio.sleep(TTL_SECONDS)


snapshots = Snapshots()


@asynccontextmanager
async def lifespan(_: FastAPI):
    snapshots.pool = await open_pool(6)
    task = asyncio.create_task(snapshots.keep_fresh())
    try:
        yield
    finally:
        task.cancel()
        await snapshots.pool.close()


app = FastAPI(title="Soroban Wrapped", version="1.0.0", lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.get("/api/wrapped/{network}", response_model=Wrapped, tags=["wrapped"])
async def wrapped(network: Literal["mainnet", "testnet"]) -> Wrapped:
    return await snapshots.get(network)


def static(path: str) -> Path | None:
    target = (WEB_DIST / path).resolve()
    return target if target.is_file() and WEB_DIST in target.parents else None


@app.get("/{path:path}", include_in_schema=False)
async def web(path: str) -> FileResponse:
    if path.startswith("api/"):
        raise HTTPException(404)
    found = static(path) or static("index.html")
    if found is None:
        raise HTTPException(404, "the web app is not built, run pnpm build in web")
    return FileResponse(found)
