WITH pairs AS (
    SELECT
        e.caller,
        e.callee,
        sum(e.calls) AS calls
    FROM contract_edges AS e
    WHERE e.network = $1
    GROUP BY e.caller, e.callee
),

called_by AS (
    SELECT
        p.callee AS contract_id,
        count(*) AS partners,
        sum(p.calls) AS calls
    FROM pairs AS p
    GROUP BY p.callee
    ORDER BY count(*) DESC
    LIMIT $2
),

calls_out AS (
    SELECT
        p.caller AS contract_id,
        count(*) AS partners,
        sum(p.calls) AS calls
    FROM pairs AS p
    GROUP BY p.caller
    ORDER BY count(*) DESC
    LIMIT $2
)

SELECT
    'callee' AS role,
    contract_id,
    partners,
    calls
FROM called_by
UNION ALL
SELECT
    'caller' AS role,
    contract_id,
    partners,
    calls
FROM calls_out
