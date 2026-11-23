WITH degree AS (
    SELECT
        c.contract_id,
        sum(c.calls) AS edge_calls
    FROM (
        SELECT
            e.caller AS contract_id,
            e.calls
        FROM contract_edges AS e
        WHERE e.network = $1
        UNION ALL
        SELECT
            e.callee AS contract_id,
            e.calls
        FROM contract_edges AS e
        WHERE e.network = $1
    ) AS c
    GROUP BY c.contract_id
    ORDER BY sum(c.calls) DESC
    LIMIT $2
)

SELECT
    g.contract_id,
    g.edge_calls,
    w.function_count,
    (
        SELECT sum(a.invocations) FROM contract_activity AS a
        WHERE a.network = $1 AND a.contract_id = g.contract_id
    ) AS invocations,
    w.function_names[1:4] AS functions
FROM degree AS g
LEFT JOIN deployed_contracts AS d ON d.network = $1 AND g.contract_id = d.contract_id
LEFT JOIN wasm_modules AS w ON d.network = w.network AND d.wasm_hash = w.hash
ORDER BY g.edge_calls DESC
