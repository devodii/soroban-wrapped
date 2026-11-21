CREATE TABLE proposal_repos (
    proposal text,
    repo text,
    weight integer DEFAULT 1 NOT NULL,
    CONSTRAINT proposal_repos_pkey PRIMARY KEY (proposal, repo),
    CONSTRAINT proposal_repos_proposal_fkey FOREIGN KEY (proposal) REFERENCES proposals (id) ON DELETE CASCADE,
    CONSTRAINT proposal_repos_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);
