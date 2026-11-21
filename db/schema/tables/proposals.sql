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
    CONSTRAINT proposals_pkey PRIMARY KEY (id)
);
