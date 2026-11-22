from pydantic import BaseModel

from soroban_wrapped.extract.analyse import Analysis


class ShardLine(BaseModel):
    repo: str
    digest: str
    analysis: Analysis | None = None
    error: str | None = None
    gone: bool = False
