CREATE TABLE chain_days (
    network text,
    day date,
    status text NOT NULL,
    ledgers integer DEFAULT 0 NOT NULL,
    invocations integer DEFAULT 0 NOT NULL,
    finished_at timestamptz,
    CONSTRAINT chain_days_pkey PRIMARY KEY (network, day)
);
