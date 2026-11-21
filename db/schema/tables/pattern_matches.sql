CREATE TABLE pattern_matches (
    repo text,
    path text,
    pattern text,
    start_byte integer,
    line_start integer NOT NULL,
    line_end integer NOT NULL,
    fn_name text,
    in_test boolean DEFAULT FALSE NOT NULL,
    snippet text NOT NULL,
    shape_hash text NOT NULL,
    captures jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT pattern_matches_pkey PRIMARY KEY (repo, path, pattern, start_byte),
    CONSTRAINT pattern_matches_file_fkey FOREIGN KEY (repo, path) REFERENCES source_files (repo, path) ON DELETE CASCADE
);
