-- 检查精选提示词
SELECT id, title, is_featured, is_public, created_at 
FROM prompts 
WHERE is_featured = true 
ORDER BY created_at DESC;

-- 如果没有精选提示词，将一些提示词标记为精选
UPDATE prompts 
SET is_featured = true 
WHERE is_public = true 
AND id IN (
  SELECT id 
  FROM prompts 
  WHERE is_public = true 
  ORDER BY created_at DESC 
  LIMIT 3
);

-- 再次检查精选提示词
SELECT id, title, is_featured, is_public, created_at 
FROM prompts 
WHERE is_featured = true 
ORDER BY created_at DESC;