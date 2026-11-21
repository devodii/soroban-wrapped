CREATE TABLE need_evidence (
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
