CREATE OR REPLACE VIEW repo_contract_links AS
WITH classified AS (
    SELECT
        rc.repo,
        rc.contract_id,
        CASE
            WHEN rc.path ~* '(^|/)(tests?|mocks?|fixtures?|test_snapshots|examples?)(/|$)|(^|/)test_[^/]*$' THEN 'fixture'
            WHEN rc.path ~* '(deploy|deployed|deployment|addresses|contracts?\.json|\.stellar|release|manifest|\.env)' THEN 'deployment'
            WHEN rc.path ~* '\.(md|rst|txt)$' THEN 'docs'
            ELSE 'code'
        END AS evidence
    FROM repo_contract_refs AS rc
),

ranked AS (
    SELECT
        repo,
        contract_id,
        min(
            CASE evidence
                WHEN 'deployment' THEN 1
                WHEN 'code' THEN 2
                WHEN 'docs' THEN 3
                ELSE 4
            END
        ) AS rank
    FROM classified
    GROUP BY repo, contract_id
)

SELECT
    r.repo,
    r.contract_id,
    d.network,
    d.live,
    d.wasm_hash,
    w.source_repo,
    CASE
        WHEN lower(w.source_repo) = lower(r.repo) THEN 'verified'
        WHEN r.rank = 1 THEN 'deployment'
        WHEN r.rank = 2 THEN 'code'
        WHEN r.rank = 3 THEN 'docs'
        ELSE 'fixture'
    END AS link
FROM ranked AS r
INNER JOIN deployed_contracts AS d ON r.contract_id = d.contract_id
LEFT JOIN wasm_modules AS w ON d.network = w.network AND d.wasm_hash = w.hash
