const sql = `
    SELECT username, xp, level, avatar
    FROM users
    WHERE role != 'admin'
    AND username NOT IN ('testuser', 'test1', 'demo')
    ORDER BY level DESC, xp DESC
    LIMIT 10
`;