CREATE TABLE IF NOT EXISTS source_files (
    repo text,
    path text,
    crate_path text,
    blob_sha text NOT NULL,
    size integer NOT NULL,
    loc integer NOT NULL,
    is_test boolean DEFAULT false NOT NULL,
    parse_errors integer DEFAULT 0 NOT NULL,
    uses text[] DEFAULT '{}' NOT NULL,
    macros text[] DEFAULT '{}' NOT NULL,
    CONSTRAINT source_files_pkey PRIMARY KEY (repo, path)
);

CREATE TABLE IF NOT EXISTS contract_calls (
    repo text,
    path text,
    start_byte integer,
    line integer NOT NULL,
    caller_fn text,
    kind text NOT NULL,
    callee text,
    method text,
    target text,
    CONSTRAINT contract_calls_pkey PRIMARY KEY (repo, path, start_byte),
    CONSTRAINT contract_calls_file_fkey FOREIGN KEY (repo, path) REFERENCES source_files (repo, path) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS contract_calls_callee ON contract_calls (callee);

CREATE TABLE IF NOT EXISTS functions (
    repo text,
    path text,
    line_start integer,
    name text,
    line_end integer NOT NULL,
    loc integer NOT NULL,
    impl_type text,
    trait_name text,
    visibility text,
    attributes text[] DEFAULT '{}' NOT NULL,
    params jsonb DEFAULT '[]' NOT NULL,
    return_type text,
    is_contract_fn boolean DEFAULT false NOT NULL,
    is_test boolean DEFAULT false NOT NULL,
    body_hash text NOT NULL,
    shape_hash text NOT NULL,
    shape_nodes integer NOT NULL,
    calls text[] DEFAULT '{}' NOT NULL,
    macros text[] DEFAULT '{}' NOT NULL,
    CONSTRAINT functions_pkey PRIMARY KEY (repo, path, line_start, name),
    CONSTRAINT functions_file_fkey FOREIGN KEY (repo, path) REFERENCES source_files (repo, path) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS functions_body_hash ON functions (body_hash);

CREATE INDEX IF NOT EXISTS functions_shape_hash ON functions (shape_hash);

CREATE TABLE IF NOT EXISTS pattern_matches (
    repo text,
    path text,
    pattern text,
    start_byte integer,
    line_start integer NOT NULL,
    line_end integer NOT NULL,
    fn_name text,
    in_test boolean DEFAULT false NOT NULL,
    snippet text NOT NULL,
    shape_hash text NOT NULL,
    captures jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT pattern_matches_pkey PRIMARY KEY (repo, path, pattern, start_byte),
    CONSTRAINT pattern_matches_file_fkey FOREIGN KEY (repo, path) REFERENCES source_files (repo, path) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS pattern_matches_pattern ON pattern_matches (pattern);

CREATE INDEX IF NOT EXISTS pattern_matches_shape_hash ON pattern_matches (shape_hash);

CREATE TABLE IF NOT EXISTS type_defs (
    repo text,
    path text,
    line_start integer,
    name text,
    kind text NOT NULL,
    attributes text[] DEFAULT '{}' NOT NULL,
    derives text[] DEFAULT '{}' NOT NULL,
    is_contracttype boolean DEFAULT false NOT NULL,
    is_contracterror boolean DEFAULT false NOT NULL,
    is_contractevent boolean DEFAULT false NOT NULL,
    members jsonb DEFAULT '[]' NOT NULL,
    shape_hash text NOT NULL,
    CONSTRAINT type_defs_pkey PRIMARY KEY (repo, path, line_start, name),
    CONSTRAINT type_defs_file_fkey FOREIGN KEY (repo, path) REFERENCES source_files (repo, path) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS type_defs_shape_hash ON type_defs (shape_hash);

ALTER TABLE source_files
ADD CONSTRAINT source_files_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE;
