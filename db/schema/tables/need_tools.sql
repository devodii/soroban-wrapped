CREATE TABLE need_tools (
    need text,
    tool text,
    relation text NOT NULL,
    relevance numeric DEFAULT 0 NOT NULL,
    CONSTRAINT need_tools_pkey PRIMARY KEY (need, tool),
    CONSTRAINT need_tools_need_fkey FOREIGN KEY (need) REFERENCES tooling_needs (id) ON DELETE CASCADE,
    CONSTRAINT need_tools_tool_fkey FOREIGN KEY (tool) REFERENCES tool_catalog (id) ON DELETE CASCADE
);
