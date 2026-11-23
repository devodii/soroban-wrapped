INSERT INTO chain_days (network, day, status, ledgers, invocations, finished_at)
VALUES ($1, $2, $3, $4, $5, now())
ON CONFLICT (network, day) DO UPDATE SET
    status = excluded.status,
    ledgers = excluded.ledgers,
    invocations = excluded.invocations,
    finished_at = now()
