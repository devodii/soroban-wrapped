CREATE TABLE need_tool_gaps (
    need text,
    tool text,
    item_index integer,
    item text NOT NULL,
    status text NOT NULL,
    coverage numeric DEFAULT 0 NOT NULL,
    evidence jsonb DEFAULT '[]' NOT NULL,
    CONSTRAINT need_tool_gaps_pkey PRIMARY KEY (need, tool, item_index),
    CONSTRAINT need_tool_gaps_need_fkey FOREIGN KEY (need) REFERENCES tooling_needs (id) ON DELETE CASCADE,
    CONSTRAINT need_tool_gaps_tool_fkey FOREIGN KEY (tool) REFERENCES tool_catalog (id) ON DELETE CASCADE
);
