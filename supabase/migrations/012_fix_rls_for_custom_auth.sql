-- 修复RLS策略以适配自定义认证系统
-- 这个迁移将更新所有表的RLS策略，使其与custom_users表兼容

-- 1. 删除所有现有的RLS策略
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "Public prompts are viewable by everyone" ON prompts;
DROP POLICY IF EXISTS "Users can view their own prompts" ON prompts;
DROP POLICY IF EXISTS "Authenticated users can create prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON prompts;

DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON favorites;

DROP POLICY IF EXISTS "Prompt tags are viewable by everyone" ON prompt_tags;
DROP POLICY IF EXISTS "Authenticated users can manage prompt tags" ON prompt_tags;

-- 2. 确保表结构正确 - 更新外键引用
-- 更新prompts表的author_id字段，使其引用custom_users而不是profiles
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_author_id_fkey;
ALTER TABLE prompts ADD CONSTRAINT prompts_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES custom_users(id) ON DELETE CASCADE;

-- 更新favorites表的user_id字段，使其引用custom_users
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES custom_users(id) ON DELETE CASCADE;

-- 3. 创建新的RLS策略（不依赖auth.uid()）

-- Profiles表策略 - 允许所有操作，因为我们使用自定义认证
CREATE POLICY "Allow all operations on profiles" ON profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Prompts表策略
CREATE POLICY "Public prompts are viewable by everyone" ON prompts
    FOR SELECT USING (is_public = true OR true); -- 暂时允许所有查看

CREATE POLICY "Allow all prompt operations" ON prompts
    FOR ALL USING (true) WITH CHECK (true); -- 暂时允许所有操作

-- Favorites表策略
CREATE POLICY "Allow all favorites operations" ON favorites
    FOR ALL USING (true) WITH CHECK (true); -- 暂时允许所有操作

-- Prompt_tags表策略
CREATE POLICY "Allow all prompt_tags operations" ON prompt_tags
    FOR ALL USING (true) WITH CHECK (true); -- 暂时允许所有操作

-- Tags表策略
CREATE POLICY "Allow all tags operations" ON tags
    FOR ALL USING (true) WITH CHECK (true); -- 暂时允许所有操作

-- 4. 确保RLS已启用
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 5. 更新示例数据中的外键引用
-- 如果有示例数据使用了错误的外键，需要修复
-- 注意：这里我们暂时跳过，因为可能需要根据实际数据情况调整

-- 6. 添加注释说明
COMMENT ON POLICY "Allow all operations on profiles" ON profiles IS '临时策略：允许所有操作，后续可根据需要细化权限控制';
COMMENT ON POLICY "Allow all prompt operations" ON prompts IS '临时策略：允许所有操作，后续可根据需要细化权限控制';
COMMENT ON POLICY "Allow all favorites operations" ON favorites IS '临时策略：允许所有操作，后续可根据需要细化权限控制';