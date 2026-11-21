CREATE TABLE IF NOT EXISTS repos (
    full_name text,
    url text NOT NULL,
    owner text NOT NULL,
    owner_type text,
    owner_location text,
    description text,
    homepage text,
    topics text[] DEFAULT '{}' NOT NULL,
    language text,
    languages jsonb DEFAULT '{}' NOT NULL,
    license text,
    stars integer DEFAULT 0 NOT NULL,
    forks integer DEFAULT 0 NOT NULL,
    watchers integer DEFAULT 0 NOT NULL,
    open_issues integer DEFAULT 0 NOT NULL,
    size_kb integer DEFAULT 0 NOT NULL,
    default_branch text,
    archived boolean DEFAULT false NOT NULL,
    is_fork boolean DEFAULT false NOT NULL,
    parent_full_name text,
    is_template boolean DEFAULT false NOT NULL,
    created_at timestamptz,
    pushed_at timestamptz,
    discovered_via text[] DEFAULT '{}' NOT NULL,
    crates_io_names text[] DEFAULT '{}' NOT NULL,
    window_commits integer,
    total_commits integer,
    head_sha text,
    locked_versions jsonb DEFAULT '{}' NOT NULL,
    rust_files integer DEFAULT 0 NOT NULL,
    rust_loc integer DEFAULT 0 NOT NULL,
    contract_crates integer DEFAULT 0 NOT NULL,
    discovered_at timestamptz DEFAULT now() NOT NULL,
    cloned_at timestamptz,
    scanned_at timestamptz,
    CONSTRAINT repos_pkey PRIMARY KEY (full_name)
);

CREATE INDEX IF NOT EXISTS repos_pushed_at ON repos (pushed_at);

CREATE TABLE IF NOT EXISTS crates (
    repo text,
    path text,
    name text,
    version text,
    edition text,
    is_workspace_root boolean DEFAULT false NOT NULL,
    workspace_members text[] DEFAULT '{}' NOT NULL,
    is_contract boolean DEFAULT false NOT NULL,
    crate_types text[] DEFAULT '{}' NOT NULL,
    soroban_sdk_requirement text,
    soroban_sdk_resolved text,
    features jsonb DEFAULT '{}' NOT NULL,
    profiles jsonb DEFAULT '{}' NOT NULL,
    metadata jsonb DEFAULT '{}' NOT NULL,
    CONSTRAINT crates_pkey PRIMARY KEY (repo, path),
    CONSTRAINT crates_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crate_dependencies (
    repo text,
    crate_path text,
    kind text,
    name text,
    requirement text,
    source text NOT NULL,
    git_url text,
    local_path text,
    features text[] DEFAULT '{}' NOT NULL,
    optional boolean DEFAULT false NOT NULL,
    CONSTRAINT crate_dependencies_pkey PRIMARY KEY (repo, crate_path, kind, name),
    CONSTRAINT crate_dependencies_crate_fkey FOREIGN KEY (repo, crate_path) REFERENCES crates (repo, path) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS crate_dependencies_name ON crate_dependencies (name);

CREATE TABLE IF NOT EXISTS repo_contributors (
    repo text,
    login text,
    contributions integer NOT NULL,
    window_commits integer DEFAULT 0 NOT NULL,
    first_commit_at timestamptz,
    last_commit_at timestamptz,
    CONSTRAINT repo_contributors_pkey PRIMARY KEY (repo, login),
    CONSTRAINT repo_contributors_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS repo_documents (
    repo text,
    path text,
    kind text NOT NULL,
    size integer NOT NULL,
    blob_sha text NOT NULL,
    text_content text,
    CONSTRAINT repo_documents_pkey PRIMARY KEY (repo, path),
    CONSTRAINT repo_documents_repo_fkey FOREIGN KEY (repo) REFERENCES repos (full_name) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS repo_documents_kind ON repo_documents (kind);
