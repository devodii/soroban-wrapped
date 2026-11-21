CREATE TABLE qa_posts (
    source text,
    id bigint,
    title text NOT NULL,
    body text,
    tags text[] DEFAULT '{}' NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    answers integer DEFAULT 0 NOT NULL,
    answered boolean DEFAULT FALSE NOT NULL,
    created_at timestamptz NOT NULL,
    url text NOT NULL,
    search tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(left(body, 20000), '')), 'C')) STORED,
    CONSTRAINT qa_posts_pkey PRIMARY KEY (source, id)
);
