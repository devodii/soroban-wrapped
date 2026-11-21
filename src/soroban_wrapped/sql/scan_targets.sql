SELECT
    full_name,
    size_kb,
    window_commits
FROM repos
WHERE
    pushed_at >= $1
    AND (languages ? $2 OR $2 = '')
    AND size_kb <= $3
    AND ($4::boolean OR scanned_at IS NULL)
ORDER BY size_kb ASC, stars DESC
