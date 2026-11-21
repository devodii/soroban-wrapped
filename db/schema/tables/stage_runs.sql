CREATE TABLE stage_runs (
    id bigint GENERATED ALWAYS AS IDENTITY,
    stage text NOT NULL,
    started_at timestamptz DEFAULT now() NOT NULL,
    finished_at timestamptz,
    status text DEFAULT 'running' NOT NULL,
    items integer DEFAULT 0 NOT NULL,
    errors integer DEFAULT 0 NOT NULL,
    detail jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT stage_runs_pkey PRIMARY KEY (id)
);
