CREATE TABLE IF NOT EXISTS proposal_repos (
    proposal text,
    repo text,
    weight integer DEFAULT 1 NOT NULL,
    CONSTRAINT proposal_repos_pkey PRIMARY KEY (proposal, repo)
);

CREATE INDEX IF NOT EXISTS proposal_repos_repo ON proposal_repos (repo);

ALTER TABLE proposal_repos
ADD CONSTRAINT proposal_repos_proposal_fkey FOREIGN KEY (proposal) REFERENCES proposals (id) ON DELETE CASCADE;

ALTER TABLE proposal_repos
ADD CONSTRAINT proposal_repos_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE;
