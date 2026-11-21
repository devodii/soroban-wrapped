SELECT r.full_name
FROM repos AS r
WHERE
    r.is_soroban
    AND (
        $1::boolean
        OR NOT EXISTS (
            SELECT 1 FROM checkpoints AS c
            WHERE c.job = 'history' AND c.key = r.full_name AND c.status = 'done'
        )
    )
ORDER BY r.window_commits DESC NULLS LAST
