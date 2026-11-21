SELECT
    (SELECT count(*) FROM repos) AS repos,
    (
        SELECT count(*) FROM repos
        WHERE is_soroban
    ) AS soroban_repos,
    (
        SELECT count(*) FROM repos
        WHERE cloned_at IS NOT NULL
    ) AS cloned,
    (
        SELECT count(*) FROM repos
        WHERE pushed_at IS NOT NULL
    ) AS with_metadata,
    (SELECT count(*) FROM functions) AS functions,
    (SELECT count(*) FROM pattern_matches) AS pattern_matches,
    (SELECT count(*) FROM commits) AS commits,
    (
        SELECT count(*) FROM commits
        WHERE is_fix
    ) AS fix_commits,
    (SELECT count(*) FROM issues) AS issues,
    (SELECT count(*) FROM deployed_contracts) AS contracts,
    (SELECT count(*) FROM wasm_modules) AS wasm_modules,
    (
        SELECT count(*) FROM catalog_candidates
        WHERE status = 'open'
    ) AS open_candidates
