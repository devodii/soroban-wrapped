CREATE TABLE IF NOT EXISTS catalog_candidates (
    id text,
    kind text NOT NULL,
    title text NOT NULL,
    signature text NOT NULL,
    repos integer DEFAULT 0 NOT NULL,
    occurrences integer DEFAULT 0 NOT NULL,
    score numeric DEFAULT 0 NOT NULL,
    evidence jsonb DEFAULT '{}' NOT NULL,
    suggestion text,
    status text DEFAULT 'open' NOT NULL,
    first_seen_at timestamptz DEFAULT now() NOT NULL,
    last_seen_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT catalog_candidates_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS catalog_candidates_status ON catalog_candidates (status, kind, score DESC);

CREATE TABLE IF NOT EXISTS query_stats (
    kind text,
    query text,
    hits integer DEFAULT 0 NOT NULL,
    new_repos integer DEFAULT 0 NOT NULL,
    soroban_repos integer DEFAULT 0 NOT NULL,
    seconds numeric DEFAULT 0 NOT NULL,
    run_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT query_stats_pkey PRIMARY KEY (kind, query)
);

CREATE TABLE IF NOT EXISTS stage_runs (
    id bigint GENERATED ALWAYS AS IDENTITY,
    stage text NOT NULL,
    started_at timestamptz DEFAULT now() NOT NULL,
    finished_at timestamptz,
    status text DEFAULT 'running' NOT NULL,
    items integer DEFAULT 0 NOT NULL,
    errors integer DEFAULT 0 NOT NULL,
    detail jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT stage_runs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS stage_runs_stage ON stage_runs (stage, started_at DESC);

ALTER TABLE repos ADD COLUMN is_soroban boolean DEFAULT false NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS repos_is_soroban ON repos (is_soroban) WHERE (is_soroban);

-- pgschema:wait
SELECT 
    COALESCE(i.indisvalid, false) as done,
    CASE 
        WHEN p.blocks_total > 0 THEN p.blocks_done * 100 / p.blocks_total
        ELSE 0
    END as progress
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_index i ON c.oid = i.indexrelid
LEFT JOIN pg_stat_progress_create_index p ON c.oid = p.index_relid
WHERE c.relname = 'repos_is_soroban'
  AND n.nspname = 'public';

ALTER TABLE source_files ADD COLUMN content text;

ALTER TABLE source_files ADD COLUMN analysed_with text;
