CREATE TABLE contract_edges (
    network text,
    caller text,
    callee text,
    day date,
    calls integer DEFAULT 0 NOT NULL,
    successful integer DEFAULT 0 NOT NULL,
    functions jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT contract_edges_pkey PRIMARY KEY (network, caller, callee, day)
);
