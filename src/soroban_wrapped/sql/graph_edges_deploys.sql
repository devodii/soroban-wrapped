INSERT INTO graph_edges (src, dst, kind, weight)
SELECT DISTINCT
    'repo:' || rc.repo,
    'contract:' || d.network || ':' || d.contract_id,
    'deploys',
    1
FROM repo_contract_refs AS rc
INNER JOIN deployed_contracts AS d ON rc.contract_id = d.contract_id
WHERE
    'repo:' || rc.repo IN (SELECT id FROM graph_nodes)
    AND 'contract:' || d.network || ':' || d.contract_id IN (SELECT id FROM graph_nodes)
