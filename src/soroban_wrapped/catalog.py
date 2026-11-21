import re
from typing import Literal

import yaml
from pydantic import BaseModel, Field, field_validator

from soroban_wrapped.workflow import Workflow

Role = Literal["boilerplate", "footgun", "adopted"]


class Match(BaseModel):
    kind: Literal["regex", "function", "type"]
    regex: str | None = None
    name: str | None = None
    contains: list[str] = Field(default_factory=list)
    lacks: list[str] = Field(default_factory=list)
    params_match: str | None = None
    max_loc: int | None = None
    contract_only: bool = False
    skip_tests: bool = False
    is_test_helper: bool = False
    type_kind: Literal["struct", "enum"] | None = None
    flags: list[str] = Field(default_factory=list)

    @field_validator("regex", "name", "params_match")
    @classmethod
    def compiles(cls, value: str | None) -> str | None:
        if value is not None:
            re.compile(value)
        return value

    @field_validator("contains", "lacks")
    @classmethod
    def all_compile(cls, values: list[str]) -> list[str]:
        for value in values:
            re.compile(value)
        return values


class Pattern(BaseModel):
    id: str
    category: str
    description: str
    match: Match
    diff: str | None = None

    @field_validator("diff")
    @classmethod
    def diff_compiles(cls, value: str | None) -> str | None:
        if value is not None:
            re.compile(value)
        return value


class BugClass(BaseModel):
    id: str
    name: str
    description: str
    severity: Literal["low", "medium", "high", "critical"]
    keywords: str

    @field_validator("keywords")
    @classmethod
    def compiles(cls, value: str) -> str:
        re.compile(value)
        return value


class Library(BaseModel):
    id: str
    name: str
    crates: list[str]
    owners: list[str] = Field(default_factory=list)
    solves: list[str] = Field(default_factory=list)


class Thresholds(BaseModel):
    min_repos: int
    min_share: float
    min_occurrences: int


class ProposalPattern(BaseModel):
    id: str
    role: Role


class Proposal(BaseModel):
    id: str
    name: str
    kind: str
    summary: str
    sketch: str | None = None
    thresholds: Thresholds
    covered_by: list[str] = Field(default_factory=list)
    patterns: list[ProposalPattern]
    bug_classes: list[str]


class Catalog(BaseModel):
    patterns: list[Pattern]
    bug_classes: list[BugClass]
    libraries: list[Library]
    proposals: list[Proposal]

    def pattern(self, pattern_id: str) -> Pattern:
        return next(p for p in self.patterns if p.id == pattern_id)

    def library_for_crate(self, crate: str) -> Library | None:
        return next((lib for lib in self.libraries if crate in lib.crates), None)

    def validate_links(self) -> None:
        patterns = {p.id for p in self.patterns}
        bugs = {b.id for b in self.bug_classes}
        libraries = {lib.id for lib in self.libraries}
        for proposal in self.proposals:
            for item in proposal.patterns:
                if item.id not in patterns:
                    raise ValueError(f"{proposal.id} uses unknown pattern {item.id}")
            for bug in proposal.bug_classes:
                if bug not in bugs:
                    raise ValueError(f"{proposal.id} maps to unknown bug class {bug}")
            for library in proposal.covered_by:
                if library not in libraries:
                    raise ValueError(f"{proposal.id} cites unknown library {library}")


def load_catalog(workflow: Workflow) -> Catalog:
    def read(name: str, key: str) -> list[dict]:
        return yaml.safe_load(workflow.catalog_path(name).read_text())[key]

    catalog = Catalog(
        patterns=read("patterns", "patterns"),
        bug_classes=read("bug_classes", "bug_classes"),
        libraries=read("libraries", "libraries"),
        proposals=read("proposals", "proposals"),
    )
    catalog.validate_links()
    return catalog


async def active_patterns(pool, catalog: Catalog) -> list[Pattern]:
    import json

    rows = await pool.fetch(
        "SELECT id, category, description, matcher, diff FROM patterns "
        "WHERE origin = 'mined' AND status = 'active' ORDER BY id"
    )
    mined = [
        Pattern(
            id=row["id"],
            category=row["category"],
            description=row["description"],
            match=Match(**json.loads(row["matcher"])),
            diff=row["diff"],
        )
        for row in rows
    ]
    return [*catalog.patterns, *mined]
