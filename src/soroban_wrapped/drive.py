import asyncio
import logging
import time
from datetime import UTC, datetime

from soroban_wrapped.runner import REGISTRY, Context, run_stage, session
from soroban_wrapped.sql_loader import load_sql

log = logging.getLogger("soroban_wrapped")

FLOW = ["metadata", "clone", "history"]
PERIODIC = ["sweep", "chain", "mine", "score", "graph"]
PERIOD = 1200
IDLE_PAUSE = 60
MAX_BACKOFF = 600


async def pending(context: Context) -> dict[str, int]:
    cutoff = datetime.combine(
        context.workflow.window.start, datetime.min.time(), tzinfo=UTC
    )
    row = await context.pool.fetchrow(
        load_sql("pending_work"),
        cutoff,
        context.workflow.clone.require_language or "",
        context.workflow.clone.max_repo_kb,
    )
    return dict(row)


async def safely(context: Context, stage_id: str, failures: dict[str, int]) -> None:
    item = next((s for s in context.workflow.stages if s.id == stage_id), None)
    if item is None or item.uses not in REGISTRY:
        return
    try:
        await run_stage(context, item)
        failures[stage_id] = 0
    except Exception:
        failures[stage_id] = failures.get(stage_id, 0) + 1
        pause = min(30 * failures[stage_id], MAX_BACKOFF)
        log.exception("%s crashed, resuming in %ss", stage_id, pause)
        await asyncio.sleep(pause)


async def keep_discovering(context: Context) -> None:
    failures: dict[str, int] = {}
    while True:
        await safely(context, "discover", failures)
        if not failures.get("discover"):
            return


async def drive(force: bool = False) -> None:
    async with session(force) as context:
        discovery = asyncio.create_task(keep_discovering(context))
        failures: dict[str, int] = {}
        last_periodic = 0.0
        while True:
            work = await pending(context)
            log.info(
                "pending work %s, discovery %s",
                work,
                "running" if not discovery.done() else "finished",
            )
            for stage_id in FLOW:
                if work.get(stage_id):
                    await safely(context, stage_id, failures)
            finished = discovery.done() and not any(work.values())
            if finished or time.monotonic() - last_periodic > PERIOD:
                for stage_id in PERIODIC:
                    await safely(context, stage_id, failures)
                last_periodic = time.monotonic()
            if finished:
                log.info("nothing left to do, all stages are caught up")
                return
            if not any(work.values()):
                await asyncio.sleep(IDLE_PAUSE)
