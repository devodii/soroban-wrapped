CREATE TABLE need_tool_verdicts (
    need text,
    tool text,
    verdict text NOT NULL,
    summary text NOT NULL,
    reasons text[] DEFAULT '{}' NOT NULL,
    missing integer DEFAULT 0 NOT NULL,
    requested integer DEFAULT 0 NOT NULL,
    covered integer DEFAULT 0 NOT NULL,
    scored_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT need_tool_verdicts_pkey PRIMARY KEY (need, tool),
    CONSTRAINT need_tool_verdicts_need_fkey FOREIGN KEY (need) REFERENCES tooling_needs (id) ON DELETE CASCADE,
    CONSTRAINT need_tool_verdicts_tool_fkey FOREIGN KEY (tool) REFERENCES tool_catalog (id) ON DELETE CASCADE
);
