CREATE TABLE network_days (
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
