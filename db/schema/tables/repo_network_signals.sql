CREATE TABLE repo_network_signals (
    repo text,
    path text,
    network text,
    signal text,
    line integer,
    evidence text NOT NULL,
    CONSTRAINT repo_network_signals_pkey PRIMARY KEY (repo, path, network, signal, line),
    CONSTRAINT repo_network_signals_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);
