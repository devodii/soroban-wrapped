WITH totals AS (
    SELECT
        a.contract_id,
        sum(a.invocations) AS invocations,
        sum(a.successful) AS successful,
        count(*) AS active_days,
        min(a.day) AS first_day,
        max(a.day) AS last_day,
        max(a.callers) AS peak_daily_accounts
    FROM contract_activity AS a
    WHERE a.network = $1
    GROUP BY a.contract_id
    ORDER BY sum(a.invocations) DESC
    LIMIT $2
),

peak AS (
    SELECT DISTINCT ON (a.contract_id)
        a.contract_id,
        a.day AS peak_day,
        a.invocations AS peak_invocations,
        (
            SELECT f.key
            FROM jsonb_each_text(a.functions) AS f
            ORDER BY f.value::bigint DESC
            LIMIT 1
        ) AS top_function
    FROM contract_activity AS a
    INNER JOIN totals AS t ON a.contract_id = t.contract_id
    WHERE a.network = $1
    ORDER BY a.contract_id ASC, a.invocations DESC
)

SELECT
    t.contract_id,
    t.invocations,
    t.successful,
    t.active_days,
    t.first_day,
    t.last_day,
    t.peak_daily_accounts,
    p.peak_day,
    p.peak_invocations,
    p.top_function,
    d.live,
    w.sdk_version,
    w.function_count,
    w.size AS wasm_size
FROM totals AS t
INNER JOIN peak AS p ON t.contract_id = p.contract_id
LEFT JOIN deployed_contracts AS d ON d.network = $1 AND t.contract_id = d.contract_id
LEFT JOIN wasm_modules AS w ON d.network = w.network AND d.wasm_hash = w.hash
ORDER BY t.invocations DESC
