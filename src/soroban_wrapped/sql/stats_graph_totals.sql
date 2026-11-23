WITH pairs AS (
    SELECT
        e.caller,
        e.callee,
        sum(e.calls) AS calls
    FROM contract_edges AS e
    WHERE e.network = $1
    GROUP BY e.caller, e.callee
),

giants AS (
    SELECT a.contract_id
    FROM contract_activity AS a
    WHERE a.network = $1
    GROUP BY a.contract_id
    ORDER BY sum(a.invocations) DESC
    LIMIT $2
)

SELECT
    count(*) AS pairs,
    sum(p.calls) AS calls,
    count(DISTINCT p.caller) AS callers,
    count(DISTINCT p.callee) AS callees,
    count(*) FILTER (WHERE p.caller = p.callee) AS self_calls,
    coalesce(sum(p.calls) FILTER (
        WHERE p.caller IN (SELECT g.contract_id FROM giants AS g)
        OR p.callee IN (SELECT g.contract_id FROM giants AS g)
    ), 0) AS giant_calls
FROM pairs AS p
