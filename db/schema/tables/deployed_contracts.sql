CREATE TABLE deployed_contracts (
    network text,
    contract_id text,
    executable text NOT NULL,
    wasm_hash text,
    live boolean DEFAULT FALSE NOT NULL,
    live_until_ledger bigint,
    observed_ledger bigint,
    recent_events integer DEFAULT 0 NOT NULL,
    recent_events_window_ledgers integer,
    observed_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT deployed_contracts_pkey PRIMARY KEY (network, contract_id),
    CONSTRAINT deployed_contracts_wasm_fkey FOREIGN KEY (network, wasm_hash) REFERENCES wasm_modules (network, hash)
);
