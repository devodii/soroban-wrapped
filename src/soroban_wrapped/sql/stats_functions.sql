SELECT
    f.key AS name,
    sum(f.value::bigint) AS calls,
    count(DISTINCT a.contract_id) AS contracts
FROM contract_activity AS a
CROSS JOIN LATERAL jsonb_each_text(a.functions) AS f
WHERE a.network = $1 AND f.key <> ''
GROUP BY f.key
ORDER BY sum(f.value::bigint) DESC
LIMIT $2
