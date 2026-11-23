WITH lives AS (
    SELECT
        a.contract_id,
        min(a.day) AS first_day,
        max(a.day) AS last_day
    FROM contract_activity AS a
    WHERE a.network = $1
    GROUP BY a.contract_id
),

edge AS (
    SELECT max(a.day) AS latest
    FROM contract_activity AS a
    WHERE a.network = $1
)

SELECT
    date_trunc('month', l.first_day)::date AS month,
    count(*) AS contracts,
    count(*) FILTER (WHERE l.last_day >= e.latest - $2::int) AS active
FROM lives AS l
CROSS JOIN edge AS e
GROUP BY date_trunc('month', l.first_day)::date
ORDER BY date_trunc('month', l.first_day)::date
