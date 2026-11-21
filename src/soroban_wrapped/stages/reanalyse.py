import asyncio
import logging

from soroban_wrapped.catalog import active_patterns
from soroban_wrapped.extract.analyse import catalog_hash
from soroban_wrapped.extract.matcher import run_patterns
from soroban_wrapped.extract.rust import parse_rust
from soroban_wrapped.runner import Context, stage
from soroban_wrapped.sql_loader import load_sql
from soroban_wrapped.workflow import Stage

log = logging.getLogger("soroban_wrapped")

BATCH = 400


def match_file(content: str, path: str, patterns: list) -> list:
    return run_patterns(patterns, parse_rust(path, content.encode()))


@stage("catalog.reanalyse")
async def reanalyse(context: Context, _: Stage) -> None:
    patterns = await active_patterns(context.pool, context.catalog)
    digest = catalog_hash(patterns)
    stale = await context.pool.fetchval(load_sql("reanalyse_count"), digest)
    if not stale:
        return
    log.info("re-matching %s stored files against %s patterns", stale, len(patterns))
    while True:
        rows = await context.pool.fetch(load_sql("reanalyse_targets"), digest, BATCH)
        if not rows:
            break
        hits = await asyncio.gather(
            *(
                asyncio.to_thread(match_file, r["content"], r["path"], patterns)
                for r in rows
            )
        )
        async with context.pool.acquire() as connection, connection.transaction():
            for row, found in zip(rows, hits, strict=True):
                await connection.execute(
                    load_sql("clear_file_matches"), row["repo"], row["path"]
                )
                await connection.executemany(
                    load_sql("ins_pattern_match"),
                    [
                        (
                            row["repo"],
                            row["path"],
                            h.pattern,
                            h.start_byte,
                            h.line_start,
                            h.line_end,
                            h.fn_name,
                            h.in_test,
                            h.snippet,
                            h.shape_hash,
                            h.captures,
                        )
                        for h in found
                    ],
                )
                await connection.execute(
                    load_sql("mark_file_analysed"), row["repo"], row["path"], digest
                )
        context.items += len(rows)
        if context.items % 2000 < BATCH:
            log.info("re-matched %s/%s files", context.items, stale)
