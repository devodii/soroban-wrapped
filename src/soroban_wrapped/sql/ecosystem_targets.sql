SELECT full_name
FROM repos
WHERE
    pushed_at >= $1
    AND ecosystem_scanned_at IS NULL
    AND NOT is_fork
    AND NOT EXISTS (
        SELECT 1 FROM checkpoints AS c
        WHERE
            c.job = 'ecosystem'
            AND c.key = repos.full_name
            AND c.status = 'failed'
            AND c.attempts >= 3
    )
ORDER BY is_soroban DESC, stars DESC
