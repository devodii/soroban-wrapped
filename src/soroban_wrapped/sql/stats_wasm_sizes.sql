SELECT
    power(2, floor(log(2, greatest(w.size / 1024.0, 1))))::int AS from_kb,
    count(*) AS contracts
FROM deployed_contracts AS d
INNER JOIN wasm_modules AS w ON d.network = w.network AND d.wasm_hash = w.hash
WHERE d.network = $1 AND w.size > 0
GROUP BY 1
ORDER BY 1
