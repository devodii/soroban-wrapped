WITH firsts AS (
    SELECT
        a.contract_id,
        min(a.day) AS first_day
    FROM contract_activity AS a
    WHERE a.network = $1
    GROUP BY a.contract_id
),

born AS (
    SELECT
        date_trunc('month', f.first_day)::date AS month,
        count(*) AS new_contracts
    FROM firsts AS f
    GROUP BY date_trunc('month', f.first_day)::date
),

volume AS (
    SELECT
        date_trunc('month', n.day)::date AS month,
        sum(n.transactions) AS transactions,
        sum(n.failed_transactions) AS failed_transactions,
        sum(n.contract_calls) AS contract_calls,
        max(n.contracts_called) AS peak_contracts_called
    FROM network_days AS n
    WHERE n.network = $1
    GROUP BY date_trunc('month', n.day)::date
)

SELECT
    v.month,
    v.transactions,
    v.failed_transactions,
    v.contract_calls,
    v.peak_contracts_called,
    coalesce(b.new_contracts, 0) AS new_contracts
FROM volume AS v
LEFT JOIN born AS b ON v.month = b.month
ORDER BY v.month
