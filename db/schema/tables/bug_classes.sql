CREATE TABLE bug_classes (
    id text,
    name text NOT NULL,
    description text NOT NULL,
    severity text NOT NULL,
    CONSTRAINT bug_classes_pkey PRIMARY KEY (id)
);
