-- 调试查询：检查prompts表和custom_users表的数据
-- 这个查询将帮助我们了解数据库中的实际情况

-- 1. 查看所有prompts及其作者信息
SELECT 
    p.id,
    p.title,
    p.author_id,
    p.is_public,
    p.is_featured,
    p.created_at,
    u.username as author_username,
    u.full_name as author_full_name
FROM prompts p
LEFT JOIN custom_users u ON p.author_id = u.id
ORDER BY p.created_at DESC
LIMIT 20;

-- 2. 统计数据
SELECT 
    'Total prompts' as metric,
    COUNT(*) as count
FROM prompts
UNION ALL
SELECT 
    'Prompts with NULL author_id' as metric,
    COUNT(*) as count
FROM prompts 
WHERE author_id IS NULL
UNION ALL
SELECT 
    'Total custom_users' as metric,
    COUNT(*) as count
FROM custom_users;