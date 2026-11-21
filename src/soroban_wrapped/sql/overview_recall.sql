WITH found AS (
    SELECT
        bool_or(via LIKE 'search:%') AS by_text,
        bool_or(via LIKE 'code:%') AS by_content,
        bool_or(via LIKE 'crates.io:%') AS by_crates
    FROM repos AS r
    CROSS JOIN LATERAL unnest(r.discovered_via) AS via
    WHERE r.is_soroban
    GROUP BY r.full_name
)

SELECT
    count(*) AS confirmed,
    count(*) FILTER (WHERE by_text) AS by_text,
    count(*) FILTER (WHERE by_content) AS by_content,
    count(*) FILTER (WHERE by_text AND by_content) AS by_both,
    count(*) FILTER (WHERE by_crates) AS by_crates
FROM found
