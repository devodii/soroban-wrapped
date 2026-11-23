SELECT a.contract_id
FROM contract_activity AS a
LEFT JOIN deployed_contracts AS d
    ON a.network = d.network AND a.contract_id = d.contract_id
WHERE a.network = $1 AND d.contract_id IS NULL
GROUP BY a.contract_id
ORDER BY sum(a.invocations) DESC
LIMIT $2
