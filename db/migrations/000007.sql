CREATE TABLE IF NOT EXISTS chain_days (
    network text,
    day date,
    status text NOT NULL,
    ledgers integer DEFAULT 0 NOT NULL,
    invocations integer DEFAULT 0 NOT NULL,
    creations integer DEFAULT 0 NOT NULL,
    finished_at timestamptz,
    CONSTRAINT chain_days_pkey PRIMARY KEY (network, day)
);

CREATE TABLE IF NOT EXISTS contract_activity (
    network text,
    contract_id text,
    day date,
    invocations integer DEFAULT 0 NOT NULL,
    successful integer DEFAULT 0 NOT NULL,
    events integer DEFAULT 0 NOT NULL,
    callers integer DEFAULT 0 NOT NULL,
    functions jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT contract_activity_pkey PRIMARY KEY (network, contract_id, day)
);

CREATE INDEX IF NOT EXISTS contract_activity_contract ON contract_activity (network, contract_id);

CREATE TABLE IF NOT EXISTS contract_creations (
    network text,
    contract_id text,
    wasm_hash text,
    deployer text,
    ledger bigint NOT NULL,
    created_at timestamptz NOT NULL,
    CONSTRAINT contract_creations_pkey PRIMARY KEY (network, contract_id)
);

CREATE INDEX IF NOT EXISTS contract_creations_wasm ON contract_creations (network, wasm_hash);
