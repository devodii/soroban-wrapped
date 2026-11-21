import asyncio
import logging
from datetime import UTC, datetime, time

from pydantic import BaseModel, Field

from soroban_wrapped.github.search import (
    code_slices,
    hits,
    patient,
    repository_slices,
)
from soroban_wrapped.linking.repo_ref import normalize_repo
from soroban_wrapped.runner import Context, stage
from soroban_wrapped.sources.crates_io import (
    Throttle,
    crate_repository,
    reverse_dependency_names,
)
from soroban_wrapped.sql_loader import load_sql
from soroban_wrapped.workflow import Stage

log = logging.getLogger("soroban_wrapped")


class Found(BaseModel):
    full_name: str
    via: set[str] = Field(default_factory=set)
    crates: set[str] = Field(default_factory=set)


class Harvest(BaseModel):
    repos: dict[str, Found] = Field(default_factory=dict)

    def note(self, full_name: str, via: str, crate: str | None = None) -> None:
        found = self.repos.setdefault(full_name.lower(), Found(full_name=full_name))
        found.via.add(via)
        if crate:
            found.crates.add(crate)


async def search_repositories(context: Context, harvest: Harvest) -> None:
    window = context.workflow.window
    since = datetime.combine(window.start, time.min, tzinfo=UTC)
    until = datetime.combine(window.end, time.max, tzinfo=UTC)
    excluded = {o.lower() for o in context.workflow.discover.exclude_owners}

    async def one(query: str) -> None:
        expanded = context.workflow.expand(query)
        slices = await repository_slices(context.github, expanded, since, until)
        for sliced in slices:
            for item in await hits(
                context.github, "/search/repositories", sliced, "repositories"
            ):
                if item["owner"]["login"].lower() not in excluded:
                    harvest.note(item["full_name"], f"search:{query}")
        log.info("repository search: %s slices for %s", len(slices), query)

    await asyncio.gather(
        *(patient(q, one) for q in context.workflow.discover.repository_queries)
    )


async def search_code(context: Context, harvest: Harvest) -> None:
    excluded = {o.lower() for o in context.workflow.discover.exclude_owners}

    async def one(query: str) -> None:
        slices = await code_slices(context.github, query)
        for sliced in slices:
            for item in await hits(context.github, "/search/code", sliced, "code"):
                repository = item["repository"]
                if repository["owner"]["login"].lower() not in excluded:
                    harvest.note(repository["full_name"], f"code:{query}")
        log.info("code search: %s slices for %s", len(slices), query)

    await asyncio.gather(
        *(patient(q, one) for q in context.workflow.discover.code_queries)
    )


async def crates_io(context: Context, harvest: Harvest) -> None:
    config = context.workflow.discover.crates_io
    throttle = Throttle()
    names: dict[str, str] = {}
    for crate in config.crates:
        names.setdefault(crate, crate)
        if config.reverse_dependencies:
            for name in await reverse_dependency_names(context.http, throttle, crate):
                names.setdefault(name, crate)
    for name, via in names.items():
        found = await crate_repository(context.http, throttle, name)
        if found.repo and normalize_repo(found.repo):
            harvest.note(found.repo, f"crates.io:{via}", name)
    log.info("crates.io: %s crates looked up", len(names))


@stage("github.discover")
async def discover(context: Context, _: Stage) -> None:
    harvest = Harvest()
    await asyncio.gather(
        search_repositories(context, harvest),
        search_code(context, harvest),
        crates_io(context, harvest),
    )
    excluded = {r.lower() for r in context.workflow.discover.exclude_repos}
    rows = [
        (
            found.full_name,
            f"https://github.com/{found.full_name}",
            found.full_name.split("/")[0],
            sorted(found.via),
            sorted(found.crates),
        )
        for key, found in sorted(harvest.repos.items())
        if key not in excluded
    ]
    async with context.pool.acquire() as connection:
        await connection.executemany(load_sql("upsert_discovered"), rows)
    context.items = len(rows)
    log.info("discovered %s repos", len(rows))
