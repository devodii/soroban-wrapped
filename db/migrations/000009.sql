CREATE TABLE IF NOT EXISTS contract_edges (
    network text,
    caller text,
    callee text,
    day date,
    calls integer DEFAULT 0 NOT NULL,
    successful integer DEFAULT 0 NOT NULL,
    functions jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT contract_edges_pkey PRIMARY KEY (network, caller, callee, day)
);

CREATE INDEX IF NOT EXISTS contract_edges_callee ON contract_edges (network, callee);

CREATE TABLE IF NOT EXISTS network_days (
    network text,
    day date,
    ledgers integer DEFAULT 0 NOT NULL,
    transactions integer DEFAULT 0 NOT NULL,
    failed_transactions integer DEFAULT 0 NOT NULL,
    operations bigint DEFAULT 0 NOT NULL,
    contract_calls integer DEFAULT 0 NOT NULL,
    contracts_called integer DEFAULT 0 NOT NULL,
    CONSTRAINT network_days_pkey PRIMARY KEY (network, day)
);
