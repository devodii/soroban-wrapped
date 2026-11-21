CREATE OR REPLACE VIEW repo_contract_links AS
 WITH classified AS (
         SELECT rc.repo,
            rc.contract_id,
                CASE
                    WHEN rc.path ~* '(^|/)(tests?|mocks?|fixtures?|test_snapshots|examples?)(/|$)|(^|/)test_[^/]*$'::text THEN 'fixture'::text
                    WHEN rc.path ~* '(deploy|deployed|deployment|addresses|contracts?\.json|\.stellar|release|manifest|\.env)'::text THEN 'deployment'::text
                    WHEN rc.path ~* '\.(md|rst|txt)$'::text THEN 'docs'::text
                    ELSE 'code'::text
                END AS evidence
           FROM repo_contract_refs rc
        ), ranked AS (
         SELECT classified.repo,
            classified.contract_id,
            min(
                CASE classified.evidence
                    WHEN 'deployment'::text THEN 1
                    WHEN 'code'::text THEN 2
                    WHEN 'docs'::text THEN 3
                    ELSE 4
                END) AS rank
           FROM classified
          GROUP BY classified.repo, classified.contract_id
        )
 SELECT r.repo,
    r.contract_id,
    d.network,
    d.live,
    d.wasm_hash,
    w.source_repo,
        CASE
            WHEN lower(w.source_repo) = lower(r.repo) THEN 'verified'::text
            WHEN r.rank = 1 THEN 'deployment'::text
            WHEN r.rank = 2 THEN 'code'::text
            WHEN r.rank = 3 THEN 'docs'::text
            ELSE 'fixture'::text
        END AS link
   FROM ranked r
     JOIN deployed_contracts d ON r.contract_id = d.contract_id
     LEFT JOIN wasm_modules w ON d.network = w.network AND d.wasm_hash = w.hash;
