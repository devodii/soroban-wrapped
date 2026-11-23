SELECT
    sum(n.ledgers) AS ledgers,
    sum(n.transactions) AS transactions,
    sum(n.failed_transactions) AS failed_transactions,
    sum(n.operations) AS operations,
    sum(n.contract_calls) AS contract_calls,
    count(*) AS days,
    min(n.day) AS first_day,
    max(n.day) AS last_day,
    (
        SELECT count(DISTINCT a.contract_id) FROM contract_activity AS a
        WHERE a.network = $1
    ) AS contracts_called,
    (
        SELECT sum(a.invocations - a.successful) FROM contract_activity AS a
        WHERE a.network = $1
    ) AS failed_calls,
    (
        SELECT count(*) FROM contract_edges AS e
        WHERE e.network = $1
    ) AS edge_days,
    (
        SELECT max(c.finished_at) FROM chain_days AS c
        WHERE c.network = $1
    ) AS synced_at,
    (
        SELECT bool_or(c.status = 'partial') FROM chain_days AS c
        WHERE c.network = $1
    ) AS has_partial_day
FROM network_days AS n
WHERE n.network = $1
