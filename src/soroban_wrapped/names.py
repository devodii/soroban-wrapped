import logging

import asyncpg
import httpx
from pydantic import BaseModel

from soroban_wrapped.networks import load_networks
from soroban_wrapped.sql_loader import load_sql

log = logging.getLogger("soroban_wrapped")

PAGE = 200
MAX_PAGES = 200


class RegistryContract(BaseModel):
    channel: str
    contract_id: str
    contract_name: str
    wasm_name: str | None = None
    is_stellar_asset_contract: bool = False


class RegistryPage(BaseModel):
    result: list[RegistryContract]
    next: str | None = None


async def fetch_names(http: httpx.AsyncClient, base: str) -> list[RegistryContract]:
    found: list[RegistryContract] = []
    cursor: str | None = None
    for _ in range(MAX_PAGES):
        params = {"limit": str(PAGE), **({"cursor": cursor} if cursor else {})}
        response = await http.get(f"{base}/v1/contracts", params=params)
        response.raise_for_status()
        page = RegistryPage(**response.json())
        found.extend(page.result)
        cursor = page.next
        if not cursor or not page.result:
            break
    return found


async def sync_names(pool: asyncpg.Pool, http: httpx.AsyncClient) -> int:
    saved = 0
    for network in ("mainnet", "testnet"):
        base = load_networks().get(network).registry
        try:
            contracts = await fetch_names(http, base)
        except (httpx.HTTPError, ValueError) as error:
            log.warning("could not read the %s registry: %s", network, error)
            continue
        async with pool.acquire() as connection, connection.transaction():
            await connection.executemany(
                load_sql("upsert_contract_name"),
                [
                    (
                        network,
                        c.contract_id,
                        c.contract_name,
                        c.channel,
                        c.wasm_name,
                        c.is_stellar_asset_contract,
                    )
                    for c in contracts
                ],
            )
        log.info("%s: %s registry names", network, len(contracts))
        saved += len(contracts)
    return saved
