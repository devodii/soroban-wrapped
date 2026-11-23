import argparse
import asyncio
import logging
import os

from soroban_wrapped.config import get_settings
from soroban_wrapped.db_utils import pgschema
from soroban_wrapped.db_utils.connection import Connection

SYNC_SECONDS = 1800


def run_schema(args: argparse.Namespace) -> int:
    connection = Connection.from_url(get_settings().database_url)
    match args.action:
        case "plan":
            return pgschema.plan(connection)
        case "apply":
            if not (connection.is_local or args.remote or os.environ.get("CI")):
                print(
                    f"{connection.label} is not on this machine. Pass --remote to "
                    "apply to it."
                )
                return 1
            return pgschema.apply(connection, allow_destructive=args.allow_destructive)
        case "verify":
            return pgschema.verify(connection)
    return 1


async def run_sync(forever: bool) -> None:
    import httpx

    from soroban_wrapped.contracts import check_network
    from soroban_wrapped.database import open_pool
    from soroban_wrapped.names import sync_names
    from soroban_wrapped.networks import NetworkName
    from soroban_wrapped.sync import sync

    log = logging.getLogger("soroban_wrapped")
    pool = await open_pool()
    try:
        async with httpx.AsyncClient(timeout=60) as http:
            while True:
                try:
                    days = await sync(pool)
                    log.info("sync imported %s days", days)
                    await sync_names(pool, http)
                    for network in NetworkName.__args__:
                        await check_network(pool, http, network)
                except Exception:
                    if not forever:
                        raise
                    log.exception("sync failed, trying again later")
                if not forever:
                    return
                await asyncio.sleep(SYNC_SECONDS)
    finally:
        await pool.close()


def main() -> None:
    parser = argparse.ArgumentParser(prog="soroban-wrapped")
    commands = parser.add_subparsers(dest="command", required=True)
    lake = commands.add_parser(
        "lake", help="summarise ledger archive days into small parquet files"
    )
    lake.add_argument("--network", default="mainnet")
    lake.add_argument("--from", dest="first", required=True)
    lake.add_argument("--to", dest="last", required=True)
    lake.add_argument("--out", default="out/lake")
    lake.add_argument("--threads", type=int, default=32)
    lake.add_argument(
        "--limit-ledgers", type=int, help="read only this many ledgers per day"
    )
    sync = commands.add_parser(
        "sync", help="import finished Actions runs and look up new contracts"
    )
    sync.add_argument(
        "--watch", action="store_true", help="keep syncing every 30 minutes"
    )
    serve = commands.add_parser("serve", help="serve the api and the web app")
    serve.add_argument("--port", type=int, default=8787)
    serve.add_argument("--host", default="127.0.0.1")
    commands.add_parser(
        "openapi", help="write the api schema the web app generates its types from"
    )
    schema = commands.add_parser("schema", help="manage the database schema")
    actions = schema.add_subparsers(dest="action", required=True)
    actions.add_parser("plan", help="write the pending changes to the next migration")
    apply = actions.add_parser("apply", help="apply the schema files")
    apply.add_argument("--allow-destructive", action="store_true")
    apply.add_argument("--remote", action="store_true")
    actions.add_parser("verify", help="fail unless the database matches the schema")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
    logging.getLogger("httpx").setLevel(logging.WARNING)
    match args.command:
        case "lake":
            from soroban_wrapped.chain.lake_run import run_lake

            asyncio.run(
                run_lake(
                    args.network,
                    args.first,
                    args.last,
                    args.out,
                    args.threads,
                    args.limit_ledgers,
                )
            )
        case "sync":
            asyncio.run(run_sync(args.watch))
        case "serve":
            import uvicorn

            uvicorn.run(
                "soroban_wrapped.api:app",
                host=args.host,
                port=args.port,
                log_level="warning",
            )
        case "openapi":
            from soroban_wrapped.openapi import write as write_openapi

            write_openapi()
        case "schema":
            raise SystemExit(run_schema(args))
