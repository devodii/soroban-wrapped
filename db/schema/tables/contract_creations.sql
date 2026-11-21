CREATE TABLE contract_creations (
    network text,
    contract_id text,
    wasm_hash text,
    deployer text,
    ledger bigint NOT NULL,
    created_at timestamptz NOT NULL,
    CONSTRAINT contract_creations_pkey PRIMARY KEY (network, contract_id)
);
