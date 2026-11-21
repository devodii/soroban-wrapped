CREATE TABLE graph_nodes (
    id text,
    kind text NOT NULL,
    label text NOT NULL,
    props jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT graph_nodes_pkey PRIMARY KEY (id)
);
