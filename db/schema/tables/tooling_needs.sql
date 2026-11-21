CREATE TABLE tooling_needs (
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
