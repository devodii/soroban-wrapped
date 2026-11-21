import logging
import time
from collections.abc import Awaitable, Callable
from contextlib import AsyncExitStack

import asyncpg
import httpx
from pydantic import BaseModel, ConfigDict

from soroban_wrapped.catalog import Catalog, load_catalog
from soroban_wrapped.config import get_settings
from soroban_wrapped.database import open_pool
from soroban_wrapped.github.client import GithubClient
from soroban_wrapped.workflow import Stage, Workflow, load_workflow

log = logging.getLogger("soroban_wrapped")


class Context(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    workflow: Workflow
    catalog: Catalog
    pool: asyncpg.Pool
    http: httpx.AsyncClient
    github: GithubClient
    force: bool = False
    limit: int | None = None


StageFunction = Callable[[Context, Stage], Awaitable[None]]
REGISTRY: dict[str, StageFunction] = {}


def stage(name: str) -> Callable[[StageFunction], StageFunction]:
    def register(function: StageFunction) -> StageFunction:
        REGISTRY[name] = function
        return function

    return register


def order(stages: list[Stage]) -> list[Stage]:
    by_id = {s.id: s for s in stages}
    ordered: list[Stage] = []
    seen: set[str] = set()

    def visit(item: Stage, trail: tuple[str, ...]) -> None:
        if item.id in trail:
            raise ValueError(f"stage cycle through {item.id}")
        if item.id in seen:
            return
        for need in item.needs:
            visit(by_id[need], (*trail, item.id))
        seen.add(item.id)
        ordered.append(item)

    for item in stages:
        visit(item, ())
    return ordered


def select(
    stages: list[Stage], only: list[str], skip: list[str], start: str | None
) -> list[Stage]:
    ordered = order(stages)
    ids = [s.id for s in ordered]
    for name in [*only, *skip, *([start] if start else [])]:
        if name not in ids:
            raise ValueError(f"unknown stage {name}, choose from {', '.join(ids)}")
    if start:
        ordered = ordered[ids.index(start) :]
    if only:
        ordered = [s for s in ordered if s.id in only]
    return [s for s in ordered if s.id not in skip]


async def run_workflow(
    only: list[str],
    skip: list[str],
    start: str | None,
    force: bool = False,
    limit: int | None = None,
) -> None:
    from soroban_wrapped import stages as _stages  # noqa: F401

    workflow = load_workflow()
    chosen = select(workflow.stages, only, skip, start)
    async with AsyncExitStack() as stack:
        pool = await open_pool()
        stack.push_async_callback(pool.close)
        http = await stack.enter_async_context(
            httpx.AsyncClient(
                timeout=60,
                limits=httpx.Limits(max_connections=200, max_keepalive_connections=50),
            )
        )
        context = Context(
            workflow=workflow,
            catalog=load_catalog(workflow),
            pool=pool,
            http=http,
            github=GithubClient(http, get_settings().github_tokens),
            force=force,
            limit=limit,
        )
        for item in chosen:
            function = REGISTRY.get(item.uses)
            if function is None:
                raise ValueError(f"{item.id} uses {item.uses}, which is not built yet")
            started = time.monotonic()
            log.info("stage %s (%s)", item.id, item.uses)
            await function(context, item)
            log.info("stage %s done in %.1fs", item.id, time.monotonic() - started)
