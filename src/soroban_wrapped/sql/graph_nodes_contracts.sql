INSERT INTO graph_nodes (id, kind, label, props)
SELECT DISTINCT
    'contract:' || l.network || ':' || l.contract_id,
    'contract',
    left(l.contract_id, 8),
    jsonb_build_object('network', l.network, 'live', l.live, 'link', l.link, 'weight', 2)
FROM repo_contract_links AS l
WHERE
    l.link IN ('verified', 'deployment', 'code')
    AND 'repo:' || l.repo IN (SELECT id FROM graph_nodes)
