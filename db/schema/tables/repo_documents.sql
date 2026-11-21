CREATE TABLE repo_documents (
    repo text,
    path text,
    kind text NOT NULL,
    size integer NOT NULL,
    blob_sha text NOT NULL,
    text_content text,
    search tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', replace(path, '/', ' ')), 'A') || setweight(to_tsvector('english', left(coalesce(text_content, ''), 200000)), 'C')) STORED,
    CONSTRAINT repo_documents_pkey PRIMARY KEY (repo, path),
    CONSTRAINT repo_documents_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);
