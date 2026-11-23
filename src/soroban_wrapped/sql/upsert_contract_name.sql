INSERT INTO contract_names (network, contract_id, name, channel, wasm_name, is_asset)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (network, contract_id) DO UPDATE SET
    name = excluded.name,
    channel = excluded.channel,
    wasm_name = excluded.wasm_name,
    is_asset = excluded.is_asset,
    fetched_at = now()
