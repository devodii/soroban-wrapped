from functools import lru_cache
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel

from soroban_wrapped.config import get_settings

NetworkName = Literal["mainnet", "testnet"]


class Network(BaseModel):
    rpc_urls: list[str]
    lake: str


class Rpc(BaseModel):
    batch_keys: int
    concurrency: int


class Networks(BaseModel):
    mainnet: Network
    testnet: Network
    rpc: Rpc

    def get(self, name: str) -> Network:
        return getattr(self, name)


@lru_cache
def load_networks(path: Path | None = None) -> Networks:
    return Networks(
        **yaml.safe_load((path or get_settings().networks_file).read_text())
    )
