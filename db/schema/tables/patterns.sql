CREATE TABLE patterns (
    id text,
    category text NOT NULL,
    description text NOT NULL,
    matcher text NOT NULL,
    CONSTRAINT patterns_pkey PRIMARY KEY (id)
);
