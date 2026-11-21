CREATE TABLE IF NOT EXISTS comments (
    id bigint GENERATED ALWAYS AS IDENTITY,
    target_kind text NOT NULL,
    target_id text NOT NULL,
    author text NOT NULL,
    body text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT comments_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS comments_target ON comments (target_kind, target_id, created_at);

CREATE TABLE IF NOT EXISTS repo_network_signals (
    repo text,
    path text,
    network text,
    signal text,
    line integer,
    evidence text NOT NULL,
    CONSTRAINT repo_network_signals_pkey PRIMARY KEY (repo, path, network, signal, line),
    CONSTRAINT repo_network_signals_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS repo_network_signals_network ON repo_network_signals (network);

ALTER TABLE repo_contract_refs ADD COLUMN network text DEFAULT 'unknown' NOT NULL;

ALTER TABLE repos ADD COLUMN networks text[] DEFAULT '{}' NOT NULL;
