import asyncio
import gzip
import json
import logging
import shutil

from soroban_wrapped import checkpoints
from soroban_wrapped.catalog import active_patterns
from soroban_wrapped.config import ROOT
from soroban_wrapped.extract.analyse import catalog_hash
from soroban_wrapped.extract.shard_line import ShardLine
from soroban_wrapped.runner import Context, stage
from soroban_wrapped.stages.extract import store
from soroban_wrapped.stages.lake import drop_artifacts, gh
from soroban_wrapped.workflow import Stage

log = logging.getLogger("soroban_wrapped")

JOB = "extract-run"
RUNS_DIR = ROOT / "out" / "extract-runs"


def read_lines(path):
    with gzip.open(path, "rt", encoding="utf-8") as source:
        for text in source:
            yield ShardLine.model_validate_json(text)


async def import_file(context: Context, path) -> int:
    stored = 0
    for line in await asyncio.to_thread(lambda: list(read_lines(path))):
        if line.analysis is None:
            await checkpoints.put(
                context.pool,
                "extract",
                line.repo,
                "gone" if line.gone else "failed",
                {},
                line.error or "",
            )
            context.errors += 1
            continue
        async with context.pool.acquire() as connection:
            await store(connection, line.repo, line.analysis, line.digest)
        stored += 1
    return stored


@stage("git.harvest")
async def harvest(context: Context, _: Stage) -> None:
    if shutil.which("gh") is None:
        return
    try:
        listing = json.loads(
            await gh(
                "run",
                "list",
                "--workflow",
                "extract.yml",
                "--status",
                "completed",
                "--limit",
                "100",
                "--json",
                "databaseId,conclusion",
            )
        )
    except RuntimeError as error:
        log.warning("could not list extract runs: %s", error)
        return
    for run in listing:
        run_id = str(run["databaseId"])
        saved = await checkpoints.get(context.pool, JOB, run_id)
        if saved and saved.done:
            continue
        target = RUNS_DIR / run_id
        try:
            await gh("run", "download", run_id, "-D", str(target))
        except RuntimeError as error:
            if "no valid artifacts" in str(error):
                await checkpoints.put(context.pool, JOB, run_id, "done", {"repos": 0})
            else:
                await checkpoints.put(
                    context.pool, JOB, run_id, "failed", {}, str(error)
                )
                context.errors += 1
            continue
        stored = 0
        for file in sorted(target.rglob("*.jsonl.gz")):
            stored += await import_file(context, file)
        await checkpoints.put(context.pool, JOB, run_id, "done", {"repos": stored})
        shutil.rmtree(target, ignore_errors=True)
        await drop_artifacts(run_id)
        context.items += stored
        log.info("extract run %s imported, %s repos", run_id, stored)


async def current_digest(context: Context) -> str:
    return catalog_hash(await active_patterns(context.pool, context.catalog))
