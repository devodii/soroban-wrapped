import asyncio
import json
import logging
import shutil

import asyncpg

from soroban_wrapped import checkpoints
from soroban_wrapped.chain.lake_import import import_directory
from soroban_wrapped.config import ROOT

log = logging.getLogger("soroban_wrapped")

JOB = "lake-run"
RUNS_DIR = ROOT / "out" / "lake-runs"
WORKFLOWS = ("lake.yml", "lake-today.yml")
LISTED = "200"


async def gh(*args: str) -> str:
    process = await asyncio.create_subprocess_exec(
        "gh", *args, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )
    out, err = await process.communicate()
    if process.returncode != 0:
        raise RuntimeError(err.decode(errors="replace")[:300])
    return out.decode()


async def finished_runs(workflow: str) -> list[str]:
    listing = json.loads(
        await gh(
            "run",
            "list",
            "--workflow",
            workflow,
            "--status",
            "success",
            "--limit",
            LISTED,
            "--json",
            "databaseId",
        )
    )
    return sorted(str(run["databaseId"]) for run in listing)


async def drop_artifacts(run_id: str) -> None:
    repo = (
        await gh("repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner")
    ).strip()
    try:
        found = json.loads(
            await gh(
                "api",
                f"repos/{repo}/actions/runs/{run_id}/artifacts",
                "--jq",
                "[.artifacts[].id]",
            )
        )
        for artifact in found:
            await gh(
                "api", "-X", "DELETE", f"repos/{repo}/actions/artifacts/{artifact}"
            )
    except RuntimeError as error:
        log.warning("could not clean artifacts of run %s: %s", run_id, error)


async def import_run(pool: asyncpg.Pool, run_id: str) -> int | None:
    target = RUNS_DIR / run_id
    shutil.rmtree(target, ignore_errors=True)
    try:
        await gh("run", "download", run_id, "-D", str(target))
    except RuntimeError as error:
        await checkpoints.put(pool, JOB, run_id, "failed", {}, str(error))
        return None
    imported = 0
    for folder in sorted(target.glob("lake-*")):
        done, _ = await import_directory(pool, folder, folder.name.split("-")[1])
        imported += done
    await checkpoints.put(pool, JOB, run_id, "done", {"days": imported})
    shutil.rmtree(target, ignore_errors=True)
    await drop_artifacts(run_id)
    return imported


async def sync(pool: asyncpg.Pool) -> int:
    if shutil.which("gh") is None:
        log.warning("gh is not installed, nothing to sync")
        return 0
    imported = 0
    for workflow in WORKFLOWS:
        try:
            runs = await finished_runs(workflow)
        except RuntimeError as error:
            log.warning("could not list %s runs: %s", workflow, error)
            continue
        for run_id in runs:
            saved = await checkpoints.get(pool, JOB, run_id)
            if saved and saved.done:
                continue
            days = await import_run(pool, run_id)
            if days is not None:
                imported += days
                log.info("%s run %s imported, %s days", workflow, run_id, days)
    return imported
