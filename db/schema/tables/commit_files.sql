CREATE TABLE commit_files (
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
