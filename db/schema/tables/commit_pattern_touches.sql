CREATE TABLE commit_pattern_touches (
    repo text,
    sha text,
    pattern text,
    added integer DEFAULT 0 NOT NULL,
    removed integer DEFAULT 0 NOT NULL,
    CONSTRAINT commit_pattern_touches_pkey PRIMARY KEY (repo, sha, pattern),
    CONSTRAINT commit_pattern_touches_commit_fkey FOREIGN KEY (repo, sha) REFERENCES commits (repo, sha) ON DELETE CASCADE
);
