INSERT INTO issues (
    repo, number, kind, title, body, state, author_login, labels, comments,
    created_at, closed_at, merged_at, is_bug, bug_classes, url
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
ON CONFLICT (repo, number) DO UPDATE SET
    title = excluded.title,
    body = excluded.body,
    state = excluded.state,
    labels = excluded.labels,
    comments = excluded.comments,
    closed_at = excluded.closed_at,
    merged_at = excluded.merged_at,
    is_bug = excluded.is_bug,
    bug_classes = excluded.bug_classes
