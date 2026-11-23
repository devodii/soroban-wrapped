WITH giants AS (
    SELECT a.contract_id
    FROM contract_activity AS a
    WHERE a.network = $1
    GROUP BY a.contract_id
    ORDER BY sum(a.invocations) DESC
    LIMIT $2
)

SELECT
    date_trunc('month', a.day)::date AS month,
    sum(a.invocations) FILTER (WHERE a.contract_id IN (SELECT g.contract_id FROM giants AS g)) AS giants,
    sum(a.invocations) FILTER (WHERE a.contract_id NOT IN (SELECT g.contract_id FROM giants AS g)) AS others
FROM contract_activity AS a
WHERE a.network = $1
GROUP BY date_trunc('month', a.day)::date
ORDER BY date_trunc('month', a.day)::date
