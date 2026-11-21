CREATE TABLE wasm_modules (
    hash text,
    network text,
    size integer NOT NULL,
    sdk_version text,
    rust_version text,
    source_repo text,
    meta jsonb DEFAULT '{}' NOT NULL,
    spec jsonb DEFAULT '{}' NOT NULL,
    function_names text[] DEFAULT '{}' NOT NULL,
    function_count integer DEFAULT 0 NOT NULL,
    event_count integer DEFAULT 0 NOT NULL,
    error_count integer DEFAULT 0 NOT NULL,
    type_count integer DEFAULT 0 NOT NULL,
    fetched_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT wasm_modules_pkey PRIMARY KEY (network, hash)
);
