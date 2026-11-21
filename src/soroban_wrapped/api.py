import json
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import asyncpg
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from soroban_wrapped.database import open_pool
from soroban_wrapped.sql_loader import load_sql

UI_DIR = Path(__file__).with_name("ui")


class CommentIn(BaseModel):
    target_kind: str = Field(pattern="^(repo|proposal|pattern|contract|node)$")
    target_id: str = Field(min_length=1, max_length=300)
    author: str = Field(default="anonymous", max_length=80)
    body: str = Field(min_length=1, max_length=4000)


def records(rows: list[asyncpg.Record]) -> list[dict[str, Any]]:
    return [dict(row) for row in rows]


def verdict(row: dict[str, Any]) -> str:
    if row["soroban_repos"] == 0:
        return "no data yet"
    share = row["boilerplate_repos"] / row["soroban_repos"]
    supported = (
        row["boilerplate_repos"] >= row["min_repos"]
        and share >= float(row["min_share"])
        and row["boilerplate_occurrences"] >= row["min_occurrences"]
    )
    return "supported" if supported else "not supported"


async def overview(pool: asyncpg.Pool, limit: int) -> dict[str, Any]:
    async with pool.acquire() as connection:
        proposals = records(await connection.fetch(load_sql("overview_proposals")))
        for row in proposals:
            row["verdict"] = verdict(row)
        return {
            "counts": dict(await connection.fetchrow(load_sql("overview_counts"))),
            "stages": records(await connection.fetch(load_sql("overview_stages"))),
            "repos": records(await connection.fetch(load_sql("overview_repos"), limit)),
            "patterns": records(await connection.fetch(load_sql("overview_patterns"))),
            "proposals": proposals,
            "candidates": records(
                await connection.fetch(load_sql("overview_candidates"))
            ),
            "queries": records(await connection.fetch(load_sql("overview_queries"))),
            "networks": records(await connection.fetch(load_sql("overview_networks"))),
        }


def create_app() -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.pool = await open_pool()
        yield
        await app.state.pool.close()

    app = FastAPI(title="soroban-wrapped", lifespan=lifespan)

    @app.get("/")
    async def page() -> FileResponse:
        return FileResponse(UI_DIR / "index.html")

    @app.get("/api/overview")
    async def get_overview(request: Request, limit: int = 500) -> JSONResponse:
        data = await overview(request.app.state.pool, min(limit, 5000))
        return JSONResponse(json.loads(json.dumps(data, default=str)))

    @app.get("/api/graph")
    async def get_graph(request: Request) -> JSONResponse:
        async with request.app.state.pool.acquire() as connection:
            data = {
                "nodes": records(await connection.fetch(load_sql("graph_nodes"))),
                "edges": records(await connection.fetch(load_sql("graph_edges"))),
            }
        return JSONResponse(json.loads(json.dumps(data, default=str)))

    @app.get("/api/comments")
    async def list_comments(
        request: Request, target_kind: str, target_id: str
    ) -> JSONResponse:
        async with request.app.state.pool.acquire() as connection:
            rows = await connection.fetch(
                load_sql("comments_list"), target_kind, target_id
            )
        return JSONResponse(json.loads(json.dumps(records(rows), default=str)))

    @app.post("/api/comments")
    async def add_comment(request: Request, comment: CommentIn) -> JSONResponse:
        async with request.app.state.pool.acquire() as connection:
            row = await connection.fetchrow(
                load_sql("comments_add"),
                comment.target_kind,
                comment.target_id,
                comment.author,
                comment.body,
            )
        if row is None:
            raise HTTPException(500, "comment was not stored")
        return JSONResponse(json.loads(json.dumps(dict(row), default=str)))

    return app


app = create_app()
