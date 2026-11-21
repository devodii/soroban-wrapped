SELECT
    topic,
    count(*) AS repos
FROM repos
CROSS JOIN LATERAL unnest(topics) AS topic
WHERE is_soroban
GROUP BY topic
HAVING count(*) >= $1
ORDER BY count(*) DESC
LIMIT 60
