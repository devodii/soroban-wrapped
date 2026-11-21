CREATE TABLE crates (
    repo text,
    path text,
    name text,
    version text,
    edition text,
    is_workspace_root boolean DEFAULT FALSE NOT NULL,
    workspace_members text[] DEFAULT '{}' NOT NULL,
    is_contract boolean DEFAULT FALSE NOT NULL,
    crate_types text[] DEFAULT '{}' NOT NULL,
    soroban_sdk_requirement text,
    soroban_sdk_resolved text,
    features jsonb DEFAULT '{}' NOT NULL,
    profiles jsonb DEFAULT '{}' NOT NULL,
    metadata jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT crates_pkey PRIMARY KEY (repo, path),
    CONSTRAINT crates_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);
