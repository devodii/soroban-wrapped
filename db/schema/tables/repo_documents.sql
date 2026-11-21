CREATE TABLE repo_documents (
    repo text,
    path text,
    kind text NOT NULL,
    size integer NOT NULL,
    blob_sha text NOT NULL,
    text_content text,
    CONSTRAINT repo_documents_pkey PRIMARY KEY (repo, path),
    CONSTRAINT repo_documents_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);
