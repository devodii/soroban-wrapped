INSERT INTO graph_nodes (id, kind, label, props)
SELECT DISTINCT
    'contract:' || d.network || ':' || d.contract_id,
    'contract',
    left(d.contract_id, 8),
    jsonb_build_object('network', d.network, 'live', d.live, 'weight', 2)
FROM deployed_contracts AS d
INNER JOIN repo_contract_refs AS rc ON d.contract_id = rc.contract_id
WHERE 'repo:' || rc.repo IN (SELECT id FROM graph_nodes)
