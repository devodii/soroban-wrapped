import argparse
import asyncio
import logging
import os

from soroban_wrapped.config import get_settings
from soroban_wrapped.db_utils import pgschema
from soroban_wrapped.db_utils.connection import Connection


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


def run_stages(args: argparse.Namespace) -> int:
    connection = Connection.from_url(get_settings().database_url)
    if not connection.is_local:
        print(f"{connection.label} is not on this machine.")
        return 1
    from soroban_wrapped.runner import run_workflow

    try:
        asyncio.run(
            run_workflow(args.only, args.skip, args.start, args.force, args.limit)
        )
    except ValueError as error:
        print(error)
        return 1
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(prog="soroban-wrapped")
    commands = parser.add_subparsers(dest="command", required=True)
    run = commands.add_parser("run", help="run the stages of the workflow yaml")
    run.add_argument("--from", dest="start", help="start at this stage and carry on")
    run.add_argument("--only", nargs="+", default=[], help="run only these stages")
    run.add_argument("--skip", nargs="+", default=[], help="leave these stages out")
    run.add_argument("--force", action="store_true", help="redo work already stored")
    run.add_argument("--limit", type=int, help="stop each stage after this many items")
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
        case "run":
            raise SystemExit(run_stages(args))
        case "schema":
            raise SystemExit(run_schema(args))
