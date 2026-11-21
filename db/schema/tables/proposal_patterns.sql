CREATE TABLE proposal_patterns (
    proposal text,
    pattern text,
    role text NOT NULL,
    CONSTRAINT proposal_patterns_pkey PRIMARY KEY (proposal, pattern),
    CONSTRAINT proposal_patterns_proposal_fkey FOREIGN KEY (proposal) REFERENCES proposals (id) ON DELETE CASCADE,
    CONSTRAINT proposal_patterns_pattern_fkey FOREIGN KEY (pattern) REFERENCES patterns (id) ON DELETE CASCADE
);
