SELECT
    extract(ISODOW FROM n.day)::int AS weekday,
    round(avg(n.contract_calls))::bigint AS contract_calls,
    round(avg(n.transactions))::bigint AS transactions,
    round(avg(n.failed_transactions::numeric / nullif(n.transactions, 0)) * 100, 2) AS failure_percent
FROM network_days AS n
INNER JOIN chain_days AS c ON n.network = c.network AND n.day = c.day
WHERE n.network = $1 AND c.status = 'done'
GROUP BY 1
ORDER BY 1
