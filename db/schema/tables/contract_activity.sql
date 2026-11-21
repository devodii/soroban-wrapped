CREATE TABLE contract_activity (
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
