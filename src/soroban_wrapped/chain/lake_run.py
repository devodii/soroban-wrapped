import logging
from datetime import date, timedelta
from pathlib import Path

import httpx

from soroban_wrapped.chain.lake import scan_day
from soroban_wrapped.workflow import load_workflow

log = logging.getLogger("soroban_wrapped")


def days(first: date, last: date) -> list[date]:
    return [first + timedelta(days=i) for i in range((last - first).days + 1)]


async def run_lake(
    network: str,
    first: str,
    last: str,
    out: str,
    threads: int,
    limit_ledgers: int | None,
) -> None:
    base = load_workflow().chain.network(network).lake
    async with httpx.AsyncClient() as http:
        for day in days(date.fromisoformat(first), date.fromisoformat(last)):
            marker = Path(out) / f"done-{day}"
            if marker.exists() and not limit_ledgers:
                log.info("%s already summarised, skipping", day)
                continue
            result = await scan_day(http, base, day, Path(out), threads, limit_ledgers)
            if not limit_ledgers:
                marker.write_text("")
            log.info(
                "%s done: %s ledgers, %s calls, %.1fs, %.1f ledgers/s",
                day,
                result.ledgers,
                result.calls,
                result.seconds,
                result.ledgers / max(result.seconds, 0.001),
            )
