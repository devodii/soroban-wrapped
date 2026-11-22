WITH topic_repos AS (
    SELECT
        t.topic,
        count(*) AS carriers,
        count(*) FILTER (WHERE repos.is_soroban) AS soroban
    FROM repos
    CROSS JOIN LATERAL unnest(repos.topics) AS t (topic)
    GROUP BY t.topic
)

SELECT
    topic,
    soroban AS repos,
    carriers,
    soroban::double precision / carriers AS precision
FROM topic_repos
WHERE soroban >= $1
ORDER BY soroban DESC
LIMIT 120
