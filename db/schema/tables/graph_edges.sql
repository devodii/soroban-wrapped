CREATE TABLE graph_edges (
    src text,
    dst text,
    kind text,
    weight numeric DEFAULT 1 NOT NULL,
    evidence jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT graph_edges_pkey PRIMARY KEY (src, dst, kind),
    CONSTRAINT graph_edges_src_fkey FOREIGN KEY (src) REFERENCES graph_nodes (id) ON DELETE CASCADE,
    CONSTRAINT graph_edges_dst_fkey FOREIGN KEY (dst) REFERENCES graph_nodes (id) ON DELETE CASCADE
);
