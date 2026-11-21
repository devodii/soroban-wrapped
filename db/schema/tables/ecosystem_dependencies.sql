CREATE TABLE ecosystem_dependencies (
    repo text,
    ecosystem text,
    path text,
    name text,
    kind text,
    requirement text,
    CONSTRAINT ecosystem_dependencies_pkey PRIMARY KEY (repo, ecosystem, path, name, kind),
    CONSTRAINT ecosystem_dependencies_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);
