CREATE TABLE releases (
    repo text,
    tag text,
    name text,
    body text,
    prerelease boolean DEFAULT FALSE NOT NULL,
    published_at timestamptz,
    CONSTRAINT releases_pkey PRIMARY KEY (repo, tag),
    CONSTRAINT releases_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);
