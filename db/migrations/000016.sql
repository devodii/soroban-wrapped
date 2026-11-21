ALTER TABLE issues ALTER COLUMN search SET EXPRESSION AS ((setweight(to_tsvector('english'::regconfig, COALESCE(title, ''::text)), 'A'::"char") || setweight(to_tsvector('english'::regconfig, COALESCE("left"(body, 20000), ''::text)), 'C'::"char")));

ALTER TABLE repo_documents ALTER COLUMN search SET EXPRESSION AS ((setweight(to_tsvector('english'::regconfig, replace(path, '/'::text, ' '::text)), 'A'::"char") || setweight(to_tsvector('english'::regconfig, "left"(COALESCE(text_content, ''::text), 200000)), 'C'::"char")));
