CREATE TABLE contract_names (
    network text,
    contract_id text,
    name text NOT NULL,
    channel text NOT NULL,
    wasm_name text,
    is_asset boolean DEFAULT FALSE NOT NULL,
    fetched_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT contract_names_pkey PRIMARY KEY (network, contract_id)
);
