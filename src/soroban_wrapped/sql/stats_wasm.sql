SELECT
    count(DISTINCT d.contract_id) AS contracts,
    count(DISTINCT d.wasm_hash) AS wasm_modules,
    count(*) FILTER (WHERE d.live) AS live,
    count(*) FILTER (WHERE NOT d.live) AS expired,
    max(w.size) AS largest_wasm,
    round(avg(w.size)) AS average_wasm,
    max(w.function_count) AS most_functions
FROM deployed_contracts AS d
LEFT JOIN wasm_modules AS w ON d.network = w.network AND d.wasm_hash = w.hash
WHERE d.network = $1
