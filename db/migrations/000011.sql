ALTER TABLE patterns ADD COLUMN origin text DEFAULT 'seed' NOT NULL;

ALTER TABLE patterns ADD COLUMN status text DEFAULT 'active' NOT NULL;

ALTER TABLE patterns ADD COLUMN diff text;

ALTER TABLE proposals ADD COLUMN origin text DEFAULT 'seed' NOT NULL;

ALTER TABLE proposals ADD COLUMN status text DEFAULT 'proposed' NOT NULL;

ALTER TABLE proposals ADD COLUMN score numeric DEFAULT 0 NOT NULL;

ALTER TABLE proposals ADD COLUMN evidence jsonb DEFAULT '{}' NOT NULL;

ALTER TABLE proposals ADD COLUMN scored_at timestamptz;

CREATE INDEX CONCURRENTLY IF NOT EXISTS proposals_score ON proposals (score DESC);

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
WHERE c.relname = 'proposals_score'
  AND n.nspname = 'public';
