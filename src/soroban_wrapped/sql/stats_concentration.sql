WITH per AS (
    SELECT
        a.contract_id,
        sum(a.invocations) AS invocations,
        count(*) AS active_days
    FROM contract_activity AS a
    WHERE a.network = $1
    GROUP BY a.contract_id
),

ranked AS (
    SELECT
        p.invocations,
        p.active_days,
        row_number() OVER (ORDER BY p.invocations DESC) AS position,
        sum(p.invocations) OVER (ORDER BY p.invocations DESC) AS running,
        sum(p.invocations) OVER () AS total,
        count(*) OVER () AS contracts
    FROM per AS p
)

SELECT
    max(contracts) AS contracts,
    max(total) AS total_calls,
    max(running) FILTER (WHERE position = 1) AS top_1,
    max(running) FILTER (WHERE position = 10) AS top_10,
    max(running) FILTER (WHERE position = 100) AS top_100,
    min(position) FILTER (WHERE running >= total * 0.5) AS contracts_for_half,
    min(position) FILTER (WHERE running >= total * 0.9) AS contracts_for_ninety,
    count(*) FILTER (WHERE active_days = 1) AS one_day_contracts,
    count(*) FILTER (WHERE invocations < 10) AS under_ten_calls
FROM ranked
