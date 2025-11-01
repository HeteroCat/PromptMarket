-- 添加缺失的提示词字段
-- 这些字段在CreatePrompt页面中被使用，但在数据库表结构中缺失

-- 添加使用说明字段
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS usage_instructions TEXT;

-- 添加示例输出字段
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS example_output TEXT;

-- 更新现有记录的默认值（可选）
UPDATE prompts 
SET usage_instructions = '', example_output = '' 
WHERE usage_instructions IS NULL OR example_output IS NULL;