WITH per AS (
    SELECT
        a.contract_id,
        count(*) AS active_days,
        sum(a.invocations) AS calls
    FROM contract_activity AS a
    WHERE a.network = $1
    GROUP BY a.contract_id
)

SELECT
    count(*) AS contracts,
    count(*) FILTER (WHERE p.calls >= 1000) AS over_thousand_calls,
    count(*) FILTER (WHERE p.active_days >= 30) AS active_a_month,
    count(*) FILTER (WHERE p.active_days >= 180) AS active_half_a_year,
    count(*) FILTER (WHERE p.calls >= 100000) AS over_hundred_thousand_calls,
    percentile_cont(0.5) WITHIN GROUP (ORDER BY p.calls) AS median_calls
FROM per AS p
