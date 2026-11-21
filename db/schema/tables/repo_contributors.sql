CREATE TABLE repo_contributors (
    repo text,
    login text,
    contributions integer NOT NULL,
    window_commits integer DEFAULT 0 NOT NULL,
    first_commit_at timestamptz,
    last_commit_at timestamptz,
    CONSTRAINT repo_contributors_pkey PRIMARY KEY (repo, login),
    CONSTRAINT repo_contributors_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);
