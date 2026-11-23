WITH inv AS (
    SELECT
        a.contract_id,
        sum(a.invocations) AS invocations
    FROM contract_activity AS a
    WHERE a.network = $1
    GROUP BY a.contract_id
)

SELECT
    coalesce(w.sdk_version, 'unknown') AS version,
    count(*) AS contracts,
    coalesce(sum(inv.invocations), 0) AS invocations
FROM deployed_contracts AS d
INNER JOIN wasm_modules AS w ON d.network = w.network AND d.wasm_hash = w.hash
LEFT JOIN inv ON d.contract_id = inv.contract_id
WHERE d.network = $1
GROUP BY coalesce(w.sdk_version, 'unknown')
ORDER BY count(*) DESC
LIMIT $2
