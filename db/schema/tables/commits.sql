CREATE TABLE commits (
    repo text,
    sha text,
    author_login text,
    author_name text,
    committed_at timestamptz NOT NULL,
    message text NOT NULL,
    parents integer DEFAULT 1 NOT NULL,
    additions integer DEFAULT 0 NOT NULL,
    deletions integer DEFAULT 0 NOT NULL,
    files_changed integer DEFAULT 0 NOT NULL,
    touches_rust boolean DEFAULT FALSE NOT NULL,
    is_fix boolean DEFAULT FALSE NOT NULL,
    bug_classes text[] DEFAULT '{}' NOT NULL,
    CONSTRAINT commits_pkey PRIMARY KEY (repo, sha),
    CONSTRAINT commits_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);
