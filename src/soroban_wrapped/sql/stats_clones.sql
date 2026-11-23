SELECT
    d.wasm_hash,
    count(*) AS contracts,
    max(w.size) AS size,
    max(w.sdk_version) AS sdk_version,
    max(w.function_count) AS function_count,
    (min(w.function_names))[1:6] AS functions
FROM deployed_contracts AS d
INNER JOIN wasm_modules AS w ON d.network = w.network AND d.wasm_hash = w.hash
WHERE d.network = $1 AND d.wasm_hash IS NOT NULL
GROUP BY d.wasm_hash
ORDER BY count(*) DESC
LIMIT $2
