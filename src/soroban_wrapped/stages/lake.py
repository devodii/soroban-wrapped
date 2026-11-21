import asyncio
import json
import logging
import shutil

from soroban_wrapped import checkpoints
from soroban_wrapped.chain.lake_import import import_directory
from soroban_wrapped.config import ROOT
from soroban_wrapped.runner import Context, stage
from soroban_wrapped.workflow import Stage

log = logging.getLogger("soroban_wrapped")

JOB = "lake-run"
RUNS_DIR = ROOT / "out" / "lake-runs"


async def gh(*args: str) -> str:
    process = await asyncio.create_subprocess_exec(
        "gh",
        *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    out, err = await process.communicate()
    if process.returncode != 0:
        raise RuntimeError(err.decode(errors="replace")[:300])
    return out.decode()


async def drop_artifacts(run_id: str) -> None:
    try:
        found = json.loads(
            await gh(
                "api",
                f"repos/devodii/soroban-wrapped/actions/runs/{run_id}/artifacts",
                "--jq",
                "[.artifacts[].id]",
            )
        )
        for artifact in found:
            await gh(
                "api",
                "-X",
                "DELETE",
                f"repos/devodii/soroban-wrapped/actions/artifacts/{artifact}",
            )
    except RuntimeError as error:
        log.warning("could not clean artifacts of run %s: %s", run_id, error)


@stage("chain.lake")
async def lake(context: Context, _: Stage) -> None:
    if shutil.which("gh") is None:
        log.warning("gh is not installed, skipping the lake import")
        return
    try:
        listing = json.loads(
            await gh(
                "run",
                "list",
                "--workflow",
                "lake.yml",
                "--status",
                "success",
                "--limit",
                "100",
                "--json",
                "databaseId",
            )
        )
    except RuntimeError as error:
        log.warning("could not list lake runs: %s", error)
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
            await checkpoints.put(context.pool, JOB, run_id, "failed", {}, str(error))
            context.errors += 1
            continue
        imported = found = 0
        for folder in sorted(target.glob("lake-*")):
            network = folder.name.split("-")[1]
            done, seen = await import_directory(context.pool, folder, network)
            imported += done
            found += seen
        if found and not imported:
            await checkpoints.put(
                context.pool,
                JOB,
                run_id,
                "failed",
                {"days": found},
                "every day looked partial, artifacts kept",
            )
            context.errors += 1
            continue
        await checkpoints.put(context.pool, JOB, run_id, "done", {"days": imported})
        shutil.rmtree(target, ignore_errors=True)
        await drop_artifacts(run_id)
        context.items += imported
        log.info("lake run %s imported, %s days", run_id, imported)
