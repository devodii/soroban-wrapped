CREATE TABLE IF NOT EXISTS ecosystem_dependencies (
    repo text,
    ecosystem text,
    path text,
    name text,
    kind text,
    requirement text,
    CONSTRAINT ecosystem_dependencies_pkey PRIMARY KEY (repo, ecosystem, path, name, kind),
    CONSTRAINT ecosystem_dependencies_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ecosystem_dependencies_name ON ecosystem_dependencies (ecosystem, name);

CREATE TABLE IF NOT EXISTS tool_catalog (
    id text,
    name text NOT NULL,
    category text NOT NULL,
    url text,
    description text NOT NULL,
    ecosystems text[] DEFAULT '{}' NOT NULL,
    packages jsonb DEFAULT '{}' NOT NULL,
    keywords text[] DEFAULT '{}' NOT NULL,
    solves text[] DEFAULT '{}' NOT NULL,
    origin text DEFAULT 'seed' NOT NULL,
    CONSTRAINT tool_catalog_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS tooling_needs (
    id text,
    title text NOT NULL,
    category text NOT NULL,
    summary text NOT NULL,
    origin text DEFAULT 'seed' NOT NULL,
    status text DEFAULT 'open' NOT NULL,
    score numeric DEFAULT 0 NOT NULL,
    query text,
    signals jsonb DEFAULT '{}' NOT NULL,
    demand jsonb DEFAULT '{}' NOT NULL,
    evidence jsonb DEFAULT '{}' NOT NULL,
    rfp jsonb DEFAULT '{}' NOT NULL,
    scored_at timestamptz,
    CONSTRAINT tooling_needs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS tooling_needs_score ON tooling_needs (score DESC);

CREATE TABLE IF NOT EXISTS need_evidence (
    need text,
    kind text,
    repo text,
    ref text,
    relevance numeric NOT NULL,
    title text,
    snippet text,
    url text,
    created_at timestamptz,
    CONSTRAINT need_evidence_pkey PRIMARY KEY (need, kind, repo, ref),
    CONSTRAINT need_evidence_need_fkey FOREIGN KEY (need) REFERENCES tooling_needs (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS need_evidence_relevance ON need_evidence (need, relevance DESC);

CREATE TABLE IF NOT EXISTS need_tools (
    need text,
    tool text,
    relation text NOT NULL,
    relevance numeric DEFAULT 0 NOT NULL,
    CONSTRAINT need_tools_pkey PRIMARY KEY (need, tool),
    CONSTRAINT need_tools_need_fkey FOREIGN KEY (need) REFERENCES tooling_needs (id) ON DELETE CASCADE,
    CONSTRAINT need_tools_tool_fkey FOREIGN KEY (tool) REFERENCES tool_catalog (id) ON DELETE CASCADE
);

ALTER TABLE issues ADD COLUMN reactions integer DEFAULT 0 NOT NULL;

ALTER TABLE issues ADD COLUMN search tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, ((COALESCE(title, ''::text) || ' '::text) || COALESCE("left"(body, 20000), ''::text)))) STORED;

CREATE INDEX CONCURRENTLY IF NOT EXISTS issues_search ON issues USING gin (search);

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
WHERE c.relname = 'issues_search'
  AND n.nspname = 'public';

ALTER TABLE repo_documents ADD COLUMN search tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, "left"(COALESCE(text_content, ''::text), 200000))) STORED;

CREATE INDEX CONCURRENTLY IF NOT EXISTS repo_documents_search ON repo_documents USING gin (search);

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
WHERE c.relname = 'repo_documents_search'
  AND n.nspname = 'public';

ALTER TABLE repos ADD COLUMN search tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, ((COALESCE(full_name, ''::text) || ' '::text) || COALESCE(description, ''::text)))) STORED;

CREATE INDEX CONCURRENTLY IF NOT EXISTS repos_search ON repos USING gin (search);

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
WHERE c.relname = 'repos_search'
  AND n.nspname = 'public';
