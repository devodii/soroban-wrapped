CREATE TABLE comments (
    id bigint GENERATED ALWAYS AS IDENTITY,
    target_kind text NOT NULL,
    target_id text NOT NULL,
    author text NOT NULL,
    body text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT comments_pkey PRIMARY KEY (id)
);
