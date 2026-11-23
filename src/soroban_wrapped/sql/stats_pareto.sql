WITH per AS (
    SELECT
        a.contract_id,
        sum(a.invocations) AS invocations
    FROM contract_activity AS a
    WHERE a.network = $1
    GROUP BY a.contract_id
),

ranked AS (
    SELECT
        row_number() OVER (ORDER BY p.invocations DESC) AS position,
        sum(p.invocations) OVER (ORDER BY p.invocations DESC) AS running,
        sum(p.invocations) OVER () AS total
    FROM per AS p
)

SELECT
    r.position AS contracts,
    round(100 * r.running::numeric / r.total, 3)::float AS share
FROM ranked AS r
WHERE r.position = any($2) OR r.position = (SELECT max(r2.position) FROM ranked AS r2)
ORDER BY r.position
