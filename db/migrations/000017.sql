CREATE TABLE IF NOT EXISTS qa_posts (
    source text,
    id bigint,
    title text NOT NULL,
    body text,
    tags text[] DEFAULT '{}' NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    answers integer DEFAULT 0 NOT NULL,
    answered boolean DEFAULT false NOT NULL,
    created_at timestamptz NOT NULL,
    url text NOT NULL,
    search tsvector GENERATED ALWAYS AS ((setweight(to_tsvector('english'::regconfig, COALESCE(title, ''::text)), 'A'::"char") || setweight(to_tsvector('english'::regconfig, COALESCE("left"(body, 20000), ''::text)), 'C'::"char"))) STORED,
    CONSTRAINT qa_posts_pkey PRIMARY KEY (source, id)
);

CREATE INDEX IF NOT EXISTS qa_posts_search ON qa_posts USING gin (search);
