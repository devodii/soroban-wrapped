CREATE TABLE IF NOT EXISTS repo_contract_refs (
    repo text,
    path text,
    contract_id text,
    line integer,
    CONSTRAINT repo_contract_refs_pkey PRIMARY KEY (repo, path, contract_id)
);

CREATE INDEX IF NOT EXISTS repo_contract_refs_contract ON repo_contract_refs (contract_id);

CREATE TABLE IF NOT EXISTS wasm_modules (
    hash text,
    network text,
    size integer NOT NULL,
    sdk_version text,
    rust_version text,
    source_repo text,
    meta jsonb DEFAULT '{}' NOT NULL,
    spec jsonb DEFAULT '{}' NOT NULL,
    function_names text[] DEFAULT '{}' NOT NULL,
    function_count integer DEFAULT 0 NOT NULL,
    event_count integer DEFAULT 0 NOT NULL,
    error_count integer DEFAULT 0 NOT NULL,
    type_count integer DEFAULT 0 NOT NULL,
    fetched_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT wasm_modules_pkey PRIMARY KEY (network, hash)
);

CREATE INDEX IF NOT EXISTS wasm_modules_source_repo ON wasm_modules (source_repo);

CREATE TABLE IF NOT EXISTS deployed_contracts (
    network text,
    contract_id text,
    executable text NOT NULL,
    wasm_hash text,
    live boolean DEFAULT false NOT NULL,
    live_until_ledger bigint,
    observed_ledger bigint,
    recent_events integer DEFAULT 0 NOT NULL,
    recent_events_window_ledgers integer,
    observed_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT deployed_contracts_pkey PRIMARY KEY (network, contract_id),
    CONSTRAINT deployed_contracts_wasm_fkey FOREIGN KEY (network, wasm_hash) REFERENCES wasm_modules (network, hash)
);

CREATE INDEX IF NOT EXISTS deployed_contracts_wasm ON deployed_contracts (network, wasm_hash);

ALTER TABLE repo_contract_refs
ADD CONSTRAINT repo_contract_refs_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE;
