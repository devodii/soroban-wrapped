CREATE TABLE repo_contract_refs (
    repo text,
    path text,
    contract_id text,
    network text DEFAULT 'unknown' NOT NULL,
    line integer,
    CONSTRAINT repo_contract_refs_pkey PRIMARY KEY (repo, path, contract_id),
    CONSTRAINT repo_contract_refs_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);
