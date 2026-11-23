SELECT
    n.day,
    n.ledgers,
    n.transactions,
    n.failed_transactions,
    n.operations,
    n.contract_calls,
    n.contracts_called,
    c.status
FROM network_days AS n
INNER JOIN chain_days AS c ON n.network = c.network AND n.day = c.day
WHERE n.network = $1
ORDER BY n.day
