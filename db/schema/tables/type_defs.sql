CREATE TABLE type_defs (
    repo text,
    path text,
    line_start integer,
    name text,
    kind text NOT NULL,
    attributes text[] DEFAULT '{}' NOT NULL,
    derives text[] DEFAULT '{}' NOT NULL,
    is_contracttype boolean DEFAULT FALSE NOT NULL,
    is_contracterror boolean DEFAULT FALSE NOT NULL,
    is_contractevent boolean DEFAULT FALSE NOT NULL,
    members jsonb DEFAULT '[]' NOT NULL,
    shape_hash text NOT NULL,
    CONSTRAINT type_defs_pkey PRIMARY KEY (repo, path, line_start, name),
    CONSTRAINT type_defs_file_fkey FOREIGN KEY (repo, path) REFERENCES source_files (repo, path) ON DELETE CASCADE
);
