CREATE TABLE crate_dependencies (
    repo text,
    crate_path text,
    kind text,
    name text,
    requirement text,
    source text NOT NULL,
    git_url text,
    local_path text,
    features text[] DEFAULT '{}' NOT NULL,
    optional boolean DEFAULT FALSE NOT NULL,
    CONSTRAINT crate_dependencies_pkey PRIMARY KEY (repo, crate_path, kind, name),
    CONSTRAINT crate_dependencies_crate_fkey FOREIGN KEY (repo, crate_path) REFERENCES crates (repo, path) ON DELETE CASCADE
);
