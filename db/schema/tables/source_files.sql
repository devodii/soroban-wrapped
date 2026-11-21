CREATE TABLE source_files (
    repo text,
    path text,
    crate_path text,
    blob_sha text NOT NULL,
    size integer NOT NULL,
    loc integer NOT NULL,
    is_test boolean DEFAULT FALSE NOT NULL,
    parse_errors integer DEFAULT 0 NOT NULL,
    content text,
    analysed_with text,
    uses text[] DEFAULT '{}' NOT NULL,
    macros text[] DEFAULT '{}' NOT NULL,
    CONSTRAINT source_files_pkey PRIMARY KEY (repo, path),
    CONSTRAINT source_files_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);
