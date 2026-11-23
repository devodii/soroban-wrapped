WITH pairs AS (
    SELECT
        e.caller,
        e.callee,
        sum(e.calls) AS calls
    FROM contract_edges AS e
    WHERE e.network = $1
    GROUP BY e.caller, e.callee
)

SELECT
    count(*) AS pairs,
    sum(p.calls) AS calls,
    count(DISTINCT p.caller) AS callers,
    count(DISTINCT p.callee) AS callees,
    count(*) FILTER (WHERE p.caller = p.callee) AS self_calls
FROM pairs AS p
