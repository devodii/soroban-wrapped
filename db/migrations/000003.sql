CREATE TABLE IF NOT EXISTS commits (
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
    touches_rust boolean DEFAULT false NOT NULL,
    is_fix boolean DEFAULT false NOT NULL,
    bug_classes text[] DEFAULT '{}' NOT NULL,
    CONSTRAINT commits_pkey PRIMARY KEY (repo, sha)
);

CREATE INDEX IF NOT EXISTS commits_committed_at ON commits (committed_at);

CREATE INDEX IF NOT EXISTS commits_is_fix ON commits (repo) WHERE (is_fix);

CREATE TABLE IF NOT EXISTS commit_files (
    repo text,
    sha text,
    path text,
    status text NOT NULL,
    additions integer DEFAULT 0 NOT NULL,
    deletions integer DEFAULT 0 NOT NULL,
    previous_path text,
    CONSTRAINT commit_files_pkey PRIMARY KEY (repo, sha, path),
    CONSTRAINT commit_files_commit_fkey FOREIGN KEY (repo, sha) REFERENCES commits (repo, sha) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS commit_pattern_touches (
    repo text,
    sha text,
    pattern text,
    added integer DEFAULT 0 NOT NULL,
    removed integer DEFAULT 0 NOT NULL,
    CONSTRAINT commit_pattern_touches_pkey PRIMARY KEY (repo, sha, pattern),
    CONSTRAINT commit_pattern_touches_commit_fkey FOREIGN KEY (repo, sha) REFERENCES commits (repo, sha) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS commit_pattern_touches_pattern ON commit_pattern_touches (pattern);

CREATE TABLE IF NOT EXISTS issues (
    repo text,
    number integer,
    kind text NOT NULL,
    title text NOT NULL,
    body text,
    state text NOT NULL,
    author_login text,
    labels text[] DEFAULT '{}' NOT NULL,
    comments integer DEFAULT 0 NOT NULL,
    created_at timestamptz NOT NULL,
    closed_at timestamptz,
    merged_at timestamptz,
    is_bug boolean DEFAULT false NOT NULL,
    bug_classes text[] DEFAULT '{}' NOT NULL,
    url text NOT NULL,
    CONSTRAINT issues_pkey PRIMARY KEY (repo, number)
);

CREATE INDEX IF NOT EXISTS issues_is_bug ON issues (repo) WHERE (is_bug);

CREATE TABLE IF NOT EXISTS releases (
    repo text,
    tag text,
    name text,
    body text,
    prerelease boolean DEFAULT false NOT NULL,
    published_at timestamptz,
    CONSTRAINT releases_pkey PRIMARY KEY (repo, tag)
);

ALTER TABLE commits
ADD CONSTRAINT commits_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE;

ALTER TABLE issues
ADD CONSTRAINT issues_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE;

ALTER TABLE releases
ADD CONSTRAINT releases_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE;
