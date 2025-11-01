-- 数据库清理和重置迁移
-- 删除不相关的表并重新创建项目所需的表结构

-- 首先删除所有不相关的表（保留auth相关的系统表）
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS api_key CASCADE;
DROP TABLE IF EXISTS device_settings CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS discussion_replies CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS emotion_data CASCADE;
DROP TABLE IF EXISTS emotion_resonance CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS work_likes CASCADE;
DROP TABLE IF EXISTS works CASCADE;

-- 删除现有的项目表（如果存在）以便重新创建
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS prompt_tags CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 重新创建用户资料表 (扩展 auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建标签表
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建提示词表
CREATE TABLE prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('ecommerce', 'education', 'finance', 'image', 'video')),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建提示词标签关联表
CREATE TABLE prompt_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(prompt_id, tag_id)
);

-- 创建用户收藏表
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- 启用行级安全策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 用户资料表的RLS策略
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 标签表的RLS策略
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can create tags" ON tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 提示词表的RLS策略
CREATE POLICY "Public prompts are viewable by everyone" ON prompts FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own prompts" ON prompts FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authenticated users can create prompts" ON prompts FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);
CREATE POLICY "Users can update their own prompts" ON prompts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own prompts" ON prompts FOR DELETE USING (auth.uid() = author_id);

-- 提示词标签关联表的RLS策略
CREATE POLICY "Prompt tags are viewable by everyone" ON prompt_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage prompt tags" ON prompt_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM prompts 
    WHERE prompts.id = prompt_tags.prompt_id 
    AND prompts.author_id = auth.uid()
  )
);

-- 收藏表的RLS策略
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- 授予权限
GRANT SELECT ON profiles TO anon, authenticated;
GRANT ALL ON profiles TO authenticated;

GRANT SELECT ON tags TO anon, authenticated;
GRANT ALL ON tags TO authenticated;

GRANT SELECT ON prompts TO anon, authenticated;
GRANT ALL ON prompts TO authenticated;

GRANT SELECT ON prompt_tags TO anon, authenticated;
GRANT ALL ON prompt_tags TO authenticated;

GRANT SELECT ON favorites TO authenticated;
GRANT ALL ON favorites TO authenticated;

-- 创建索引
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_author ON prompts(author_id);
CREATE INDEX idx_prompts_featured ON prompts(is_featured);
CREATE INDEX idx_prompts_public ON prompts(is_public);
CREATE INDEX idx_prompt_tags_prompt ON prompt_tags(prompt_id);
CREATE INDEX idx_prompt_tags_tag ON prompt_tags(tag_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_prompt ON favorites(prompt_id);

-- 插入默认标签数据
INSERT INTO tags (name, color) VALUES
  ('AI写作', '#3B82F6'),
  ('营销文案', '#10B981'),
  ('教学设计', '#F59E0B'),
  ('数据分析', '#EF4444'),
  ('创意设计', '#8B5CF6'),
  ('客服对话', '#06B6D4'),
  ('产品描述', '#84CC16'),
  ('学习辅导', '#F97316'),
  ('图像生成', '#EC4899'),
  ('视频脚本', '#6366F1');

-- 插入示例提示词数据（需要先有用户资料才能插入）
-- 这些数据将在用户注册后通过应用程序添加