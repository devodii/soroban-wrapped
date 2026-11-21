WITH roles AS (
    SELECT
        pp.proposal,
        pp.role,
        m.repo,
        count(*) AS occurrences
    FROM proposal_patterns AS pp
    INNER JOIN pattern_matches AS m ON pp.pattern = m.pattern AND NOT m.in_test
    GROUP BY pp.proposal, pp.role, m.repo
)

SELECT
    p.id,
    p.name,
    p.summary,
    p.min_repos,
    p.min_share,
    p.min_occurrences,
    p.covered_by,
    (
        SELECT count(*) FROM repos AS s
        WHERE s.is_soroban
    ) AS soroban_repos,
    count(DISTINCT r.repo) FILTER (WHERE r.role = 'boilerplate') AS boilerplate_repos,
    coalesce(sum(r.occurrences) FILTER (WHERE r.role = 'boilerplate'), 0) AS boilerplate_occurrences,
    count(DISTINCT r.repo) FILTER (WHERE r.role = 'footgun') AS footgun_repos,
    coalesce(sum(r.occurrences) FILTER (WHERE r.role = 'footgun'), 0) AS footgun_occurrences,
    count(DISTINCT r.repo) FILTER (WHERE r.role = 'adopted') AS adopted_repos
FROM proposals AS p
LEFT JOIN roles AS r ON p.id = r.proposal
GROUP BY p.id
ORDER BY p.id
