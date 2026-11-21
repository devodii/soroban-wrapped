CREATE TABLE tool_catalog (
    id text,
    name text NOT NULL,
    category text NOT NULL,
    url text,
    description text NOT NULL,
    ecosystems text[] DEFAULT '{}' NOT NULL,
    packages jsonb DEFAULT '{}' NOT NULL,
    keywords text[] DEFAULT '{}' NOT NULL,
    solves text[] DEFAULT '{}' NOT NULL,
    origin text DEFAULT 'seed' NOT NULL,
    CONSTRAINT tool_catalog_pkey PRIMARY KEY (id)
);
