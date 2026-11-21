CREATE TABLE IF NOT EXISTS bug_classes (
    id text,
    name text NOT NULL,
    description text NOT NULL,
    severity text NOT NULL,
    CONSTRAINT bug_classes_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS graph_nodes (
    id text,
    kind text NOT NULL,
    label text NOT NULL,
    props jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT graph_nodes_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS graph_nodes_kind ON graph_nodes (kind);

CREATE TABLE IF NOT EXISTS graph_edges (
    src text,
    dst text,
    kind text,
    weight numeric DEFAULT 1 NOT NULL,
    evidence jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT graph_edges_pkey PRIMARY KEY (src, dst, kind),
    CONSTRAINT graph_edges_dst_fkey FOREIGN KEY (dst) REFERENCES graph_nodes (id) ON DELETE CASCADE,
    CONSTRAINT graph_edges_src_fkey FOREIGN KEY (src) REFERENCES graph_nodes (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS graph_edges_dst ON graph_edges (dst, kind);

CREATE INDEX IF NOT EXISTS graph_edges_kind ON graph_edges (kind);

CREATE TABLE IF NOT EXISTS patterns (
    id text,
    category text NOT NULL,
    description text NOT NULL,
    matcher text NOT NULL,
    CONSTRAINT patterns_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS proposals (
    id text,
    name text NOT NULL,
    kind text NOT NULL,
    summary text NOT NULL,
    sketch text,
    min_repos integer NOT NULL,
    min_share numeric(5,4) NOT NULL,
    min_occurrences integer NOT NULL,
    covered_by text[] DEFAULT '{}' NOT NULL,
    CONSTRAINT proposals_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS proposal_bug_classes (
    proposal text,
    bug_class text,
    CONSTRAINT proposal_bug_classes_pkey PRIMARY KEY (proposal, bug_class),
    CONSTRAINT proposal_bug_classes_bug_class_fkey FOREIGN KEY (bug_class) REFERENCES bug_classes (id) ON DELETE CASCADE,
    CONSTRAINT proposal_bug_classes_proposal_fkey FOREIGN KEY (proposal) REFERENCES proposals (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS proposal_patterns (
    proposal text,
    pattern text,
    role text NOT NULL,
    CONSTRAINT proposal_patterns_pkey PRIMARY KEY (proposal, pattern),
    CONSTRAINT proposal_patterns_pattern_fkey FOREIGN KEY (pattern) REFERENCES patterns (id) ON DELETE CASCADE,
    CONSTRAINT proposal_patterns_proposal_fkey FOREIGN KEY (proposal) REFERENCES proposals (id) ON DELETE CASCADE
);
