SELECT
    e.caller,
    e.callee,
    sum(e.calls) AS calls
FROM contract_edges AS e
WHERE e.network = $1 AND e.caller = any($2) AND e.callee = any($2) AND e.caller <> e.callee
GROUP BY e.caller, e.callee
ORDER BY sum(e.calls) DESC
LIMIT $3
