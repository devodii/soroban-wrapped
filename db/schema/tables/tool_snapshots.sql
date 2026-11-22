CREATE TABLE tool_snapshots (
    tool text,
    repo text NOT NULL,
    fetched_at timestamptz DEFAULT now() NOT NULL,
    pushed_at timestamptz,
    archived boolean DEFAULT FALSE NOT NULL,
    stars integer DEFAULT 0 NOT NULL,
    open_issues integer DEFAULT 0 NOT NULL,
    merged_prs_180d integer DEFAULT 0 NOT NULL,
    last_release_at timestamptz,
    data jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT tool_snapshots_pkey PRIMARY KEY (tool),
    CONSTRAINT tool_snapshots_tool_fkey FOREIGN KEY (tool) REFERENCES tool_catalog (id) ON DELETE CASCADE
);
