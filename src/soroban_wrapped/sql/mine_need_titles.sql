SELECT
    r.owner,
    i.title
FROM issues AS i
INNER JOIN repos AS r ON i.repo = r.full_name
WHERE (r.is_stellar OR r.is_soroban) AND NOT r.is_fork AND i.kind = 'issue'
