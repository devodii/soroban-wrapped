CREATE TABLE query_stats (
    kind text,
    query text,
    hits integer DEFAULT 0 NOT NULL,
    new_repos integer DEFAULT 0 NOT NULL,
    soroban_repos integer DEFAULT 0 NOT NULL,
    seconds numeric DEFAULT 0 NOT NULL,
    run_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT query_stats_pkey PRIMARY KEY (kind, query)
);
