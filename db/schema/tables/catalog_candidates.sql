CREATE TABLE catalog_candidates (
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
