-- 查看prompts表中的所有数据，特别关注author_id字段
SELECT 
    id,
    title,
    author_id,
    is_public,
    is_featured,
    created_at
FROM prompts 
ORDER BY created_at DESC;

-- 查看custom_users表中的用户数据
SELECT 
    id,
    username,
    phone,
    full_name,
    created_at
FROM custom_users 
ORDER BY created_at DESC;

-- 检查是否有author_id为NULL的prompts
SELECT COUNT(*) as null_author_count
FROM prompts 
WHERE author_id IS NULL;

-- 检查prompts和custom_users的关联情况
SELECT 
    p.id as prompt_id,
    p.title,
    p.author_id,
    u.username,
    u.full_name
FROM prompts p
LEFT JOIN custom_users u ON p.author_id = u.id
ORDER BY p.created_at DESC;