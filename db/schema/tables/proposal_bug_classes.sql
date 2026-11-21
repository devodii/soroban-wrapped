CREATE TABLE proposal_bug_classes (
    proposal text,
    bug_class text,
    CONSTRAINT proposal_bug_classes_pkey PRIMARY KEY (proposal, bug_class),
    CONSTRAINT proposal_bug_classes_proposal_fkey FOREIGN KEY (proposal) REFERENCES proposals (id) ON DELETE CASCADE,
    CONSTRAINT proposal_bug_classes_bug_class_fkey FOREIGN KEY (bug_class) REFERENCES bug_classes (id) ON DELETE CASCADE
);
