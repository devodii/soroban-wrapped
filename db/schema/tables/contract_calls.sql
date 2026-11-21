CREATE TABLE contract_calls (
    repo text,
    path text,
    start_byte integer,
    line integer NOT NULL,
    caller_fn text,
    kind text NOT NULL,
    callee text,
    method text,
    target text,
    CONSTRAINT contract_calls_pkey PRIMARY KEY (repo, path, start_byte),
    CONSTRAINT contract_calls_file_fkey FOREIGN KEY (repo, path) REFERENCES source_files (repo, path) ON DELETE CASCADE
);
