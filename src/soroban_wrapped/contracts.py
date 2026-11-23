import asyncio
import logging

import asyncpg
import httpx

from soroban_wrapped.chain.rpc import (
    RpcClient,
    code_key,
    instance_key,
    read_code,
    read_instance,
)
from soroban_wrapped.chain.wasm import read_wasm
from soroban_wrapped.networks import load_networks
from soroban_wrapped.sql_loader import load_sql

log = logging.getLogger("soroban_wrapped")

PER_RUN = 3000
WASM_BATCH = 20


def chunks(items: list, size: int) -> list[list]:
    return [items[i : i + size] for i in range(0, len(items), size)]


async def check_network(
    pool: asyncpg.Pool, http: httpx.AsyncClient, network: str, limit: int = PER_RUN
) -> int:
    config = load_networks()
    rpc = RpcClient(http, config.get(network).rpc_urls)
    gate = asyncio.Semaphore(config.rpc.concurrency)
    async with pool.acquire() as connection:
        ids = [
            row["contract_id"]
            for row in await connection.fetch(
                load_sql("unchecked_contracts"), network, limit
            )
        ]
        known = {
            row["hash"]
            for row in await connection.fetch(load_sql("known_wasm_hashes"), network)
        }
    instances = {}

    async def look(batch: list[str]) -> None:
        keys = {instance_key(cid): cid for cid in batch}
        async with gate:
            found = await rpc.entries(list(keys))
        for key, entry in found.items():
            instances[keys[key]] = read_instance(keys[key], entry)

    await asyncio.gather(*(look(b) for b in chunks(ids, config.rpc.batch_keys)))
    wanted = sorted({i.wasm_hash for i in instances.values() if i.wasm_hash} - known)
    modules: dict[str, tuple] = {}

    async def fetch(batch: list[str]) -> None:
        keys = {code_key(h): h for h in batch}
        async with gate:
            found = await rpc.entries(list(keys))
        for key, wasm_hash in keys.items():
            entry = found.get(key)
            if entry is None:
                modules[wasm_hash] = (0, None, None, {"missing": True}, {})
                continue
            info = read_wasm(read_code(entry))
            modules[wasm_hash] = (
                info.size,
                info.sdk_version,
                info.rust_version,
                info.meta,
                info.spec,
            )

    await asyncio.gather(*(fetch(b) for b in chunks(wanted, WASM_BATCH)))
    async with pool.acquire() as connection, connection.transaction():
        for wasm_hash, (size, sdk, rust, meta, spec) in modules.items():
            await connection.execute(
                load_sql("upsert_wasm_module"),
                wasm_hash,
                network,
                size,
                sdk,
                rust,
                meta,
                spec,
                [f["name"] for f in spec.get("functions", [])],
                len(spec.get("functions", [])),
                len(spec.get("events", [])),
                len(spec.get("errors", [])),
                len(spec.get("structs", []))
                + len(spec.get("unions", []))
                + len(spec.get("enums", [])),
            )
        for instance in instances.values():
            await connection.execute(
                load_sql("upsert_deployed_contract"),
                network,
                instance.contract_id,
                instance.executable,
                instance.wasm_hash,
                (instance.live_until or 0) >= rpc.latest,
                instance.live_until,
                rpc.latest,
            )
    log.info(
        "%s: %s of %s contracts looked up, %s new wasm modules",
        network,
        len(instances),
        len(ids),
        len(modules),
    )
    return len(instances)
