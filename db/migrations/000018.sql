CREATE TABLE IF NOT EXISTS need_tool_gaps (
    need text,
    tool text,
    item_index integer,
    item text NOT NULL,
    status text NOT NULL,
    coverage numeric DEFAULT 0 NOT NULL,
    evidence jsonb DEFAULT '[]' NOT NULL,
    CONSTRAINT need_tool_gaps_pkey PRIMARY KEY (need, tool, item_index)
);

CREATE TABLE IF NOT EXISTS need_tool_verdicts (
    need text,
    tool text,
    verdict text NOT NULL,
    summary text NOT NULL,
    reasons text[] DEFAULT '{}' NOT NULL,
    missing integer DEFAULT 0 NOT NULL,
    requested integer DEFAULT 0 NOT NULL,
    covered integer DEFAULT 0 NOT NULL,
    scored_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT need_tool_verdicts_pkey PRIMARY KEY (need, tool)
);

CREATE TABLE IF NOT EXISTS tool_snapshots (
    tool text,
    repo text NOT NULL,
    fetched_at timestamptz DEFAULT now() NOT NULL,
    pushed_at timestamptz,
    archived boolean DEFAULT false NOT NULL,
    stars integer DEFAULT 0 NOT NULL,
    open_issues integer DEFAULT 0 NOT NULL,
    merged_prs_180d integer DEFAULT 0 NOT NULL,
    last_release_at timestamptz,
    data jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT tool_snapshots_pkey PRIMARY KEY (tool)
);

ALTER TABLE need_tool_gaps
ADD CONSTRAINT need_tool_gaps_need_fkey FOREIGN KEY (need) REFERENCES tooling_needs (id) ON DELETE CASCADE;

ALTER TABLE need_tool_gaps
ADD CONSTRAINT need_tool_gaps_tool_fkey FOREIGN KEY (tool) REFERENCES tool_catalog (id) ON DELETE CASCADE;

ALTER TABLE need_tool_verdicts
ADD CONSTRAINT need_tool_verdicts_need_fkey FOREIGN KEY (need) REFERENCES tooling_needs (id) ON DELETE CASCADE;

ALTER TABLE need_tool_verdicts
ADD CONSTRAINT need_tool_verdicts_tool_fkey FOREIGN KEY (tool) REFERENCES tool_catalog (id) ON DELETE CASCADE;

ALTER TABLE tool_snapshots
ADD CONSTRAINT tool_snapshots_tool_fkey FOREIGN KEY (tool) REFERENCES tool_catalog (id) ON DELETE CASCADE;
