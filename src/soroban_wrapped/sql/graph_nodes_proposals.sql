INSERT INTO graph_nodes (id, kind, label, props)
SELECT
    'proposal:' || id,
    'proposal',
    left(name, 80),
    jsonb_build_object('score', score, 'origin', origin, 'status', status, 'weight', score)
FROM proposals
WHERE id IN (
    SELECT id FROM proposals
    ORDER BY score DESC LIMIT $1
)
