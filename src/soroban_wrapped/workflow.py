import re
from datetime import UTC, date, datetime
from functools import lru_cache
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, Field, field_validator, model_validator

from soroban_wrapped.config import get_settings

Network = Literal["mainnet", "testnet", "futurenet"]


class Window(BaseModel):
    start: date
    end: date

    @field_validator("end", mode="before")
    @classmethod
    def resolve_today(cls, value: object) -> object:
        return datetime.now(UTC).date() if value == "today" else value

    def contains(self, moment: datetime) -> bool:
        return self.start <= moment.date() <= self.end


class CatalogFiles(BaseModel):
    patterns: Path
    bug_classes: Path
    libraries: Path
    proposals: Path
    tools: Path
    needs: Path


class CratesIo(BaseModel):
    crates: list[str]
    reverse_dependencies: bool = True


class Discover(BaseModel):
    crates_io: CratesIo
    repository_queries: list[str]
    code_queries: list[str]
    exclude_owners: list[str] = []
    exclude_repos: list[str] = []
    min_window_commits: int = 0


class Clone(BaseModel):
    shallow_since: str
    max_repo_kb: int
    concurrency: int
    keep: bool = False
    require_language: str | None = None
    max_rust_files: int = 4000
    max_signal_files: int = 1500
    signal_suffixes: list[str]
    rust_suffixes: list[str]
    manifests: list[str]
    max_file_bytes: int
    skip_directories: list[str]


class DocumentKind(BaseModel):
    globs: list[str]


class Documents(BaseModel):
    max_text_bytes: int
    kinds: dict[str, DocumentKind]


class History(BaseModel):
    commits: Literal["all", "fixes", "none"] = "all"
    commit_files: bool = True
    issues: Literal["all", "bugs", "none"] = "all"
    releases: bool = True
    contributors: bool = True
    profiles: bool = True
    fix_message: str

    @field_validator("fix_message")
    @classmethod
    def compiles(cls, value: str) -> str:
        re.compile(value)
        return value


class NetworkSignal(BaseModel):
    signal: str
    regex: str

    @field_validator("regex")
    @classmethod
    def compiles(cls, value: str) -> str:
        re.compile(value)
        return value


class ChainNetwork(BaseModel):
    rpc_urls: list[str]
    lake: str


class Lake(BaseModel):
    concurrency: int = 32
    days_per_run: int = 0
    newest_first: bool = True
    contracts_only: bool = True


class Rpc(BaseModel):
    batch_keys: int = 200
    concurrency: int = 4


class Chain(BaseModel):
    mainnet: ChainNetwork
    testnet: ChainNetwork
    lake: Lake
    rpc: Rpc

    def network(self, name: str) -> ChainNetwork:
        return getattr(self, name)


class Mine(BaseModel):
    min_owners: int = 5
    min_function_nodes: int = 14
    max_function_loc: int = 70
    top_per_kind: int = 40
    min_macro_owners: int = 3
    min_term_owners: int = 8
    min_term_lift: float = 3.0
    min_topic_repos: int = 6
    soroban_markers: list[str] = Field(default_factory=list)


class Weights(BaseModel):
    owners: float = 1.0
    independence: float = 0.6
    mainnet: float = 0.8
    recency: float = 0.5
    fixes: float = 0.4
    loc: float = 0.4
    covered: float = -0.7


class Score(BaseModel):
    recent_days: int = 90
    weights: Weights = Field(default_factory=Weights)


class Accept(BaseModel):
    policy: Literal["suggest", "auto"] = "suggest"
    min_score: float = 45
    min_owners: int = 8
    patterns: Literal["off", "auto"] = "auto"
    max_mined_patterns: int = 40
    queries: Literal["off", "auto"] = "auto"
    min_topic_repos: int = 15


class Improve(BaseModel):
    mine: Mine = Field(default_factory=Mine)
    score: Score = Field(default_factory=Score)
    accept: Accept = Field(default_factory=Accept)


class Stage(BaseModel):
    id: str
    uses: str
    needs: list[str] = Field(default_factory=list)
    options: dict[str, object] = Field(default_factory=dict, alias="with")


class Workflow(BaseModel):
    name: str
    summary: str
    window: Window
    networks: list[Network]
    catalog: CatalogFiles
    discover: Discover
    clone: Clone
    documents: Documents
    history: History
    networks_signals: dict[Network, list[NetworkSignal]]
    chain: Chain
    improve: Improve = Field(default_factory=Improve)
    stages: list[Stage]
    root: Path = Path(".")

    @model_validator(mode="after")
    def stages_are_wired(self) -> "Workflow":
        ids = [stage.id for stage in self.stages]
        if len(ids) != len(set(ids)):
            raise ValueError("stage ids must be unique")
        for stage in self.stages:
            for need in stage.needs:
                if need not in ids:
                    raise ValueError(f"{stage.id} needs unknown stage {need}")
        return self

    def expand(self, text: str) -> str:
        return text.replace("{start}", self.window.start.isoformat()).replace(
            "{end}", self.window.end.isoformat()
        )

    def catalog_path(self, name: str) -> Path:
        return self.root / getattr(self.catalog, name)


@lru_cache
def load_workflow(path: Path | None = None) -> Workflow:
    file = path or get_settings().workflow_file
    raw = yaml.safe_load(file.read_text())
    return Workflow(**raw, root=file.parent)
