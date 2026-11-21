CREATE TABLE proposals (
    id text,
    name text NOT NULL,
    kind text NOT NULL,
    summary text NOT NULL,
    sketch text,
    min_repos integer NOT NULL,
    min_share numeric(5, 4) NOT NULL,
    min_occurrences integer NOT NULL,
    covered_by text[] DEFAULT '{}' NOT NULL,
    origin text DEFAULT 'seed' NOT NULL,
    status text DEFAULT 'proposed' NOT NULL,
    score numeric DEFAULT 0 NOT NULL,
    evidence jsonb DEFAULT '{}' NOT NULL,
    scored_at timestamptz,
    CONSTRAINT proposals_pkey PRIMARY KEY (id)
);
