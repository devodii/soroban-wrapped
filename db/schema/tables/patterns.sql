CREATE TABLE patterns (
    id text,
    category text NOT NULL,
    description text NOT NULL,
    matcher text NOT NULL,
    origin text DEFAULT 'seed' NOT NULL,
    status text DEFAULT 'active' NOT NULL,
    diff text,
    CONSTRAINT patterns_pkey PRIMARY KEY (id)
);
