-- 创建提示词模板网站的数据库表结构

-- 用户资料表 (扩展 auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 提示词表
CREATE TABLE IF NOT EXISTS prompts (
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

-- 提示词标签关联表
CREATE TABLE IF NOT EXISTS prompt_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(prompt_id, tag_id)
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS favorites (
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
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_author ON prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_featured ON prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompt_tags_prompt ON prompt_tags(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_tags_tag ON prompt_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_prompt ON favorites(prompt_id);

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
  ('视频脚本', '#6366F1')
ON CONFLICT (name) DO NOTHING;

-- 插入示例提示词数据
INSERT INTO prompts (title, content, description, category, is_featured) VALUES
  ('电商产品描述生成器', '请为以下产品生成一个吸引人的产品描述：\n\n产品名称：[产品名称]\n产品特点：[产品特点]\n目标客户：[目标客户群体]\n\n要求：\n1. 突出产品核心优势\n2. 使用情感化语言\n3. 包含购买理由\n4. 字数控制在200字以内', '专业的电商产品描述生成模板，帮助提升产品转化率', 'ecommerce', true),
  
  ('在线课程大纲设计', '请为以下主题设计一个完整的在线课程大纲：\n\n课程主题：[课程主题]\n目标学员：[学员水平]\n课程时长：[预期时长]\n\n请包含：\n1. 课程目标和学习成果\n2. 详细的章节安排\n3. 每章节的重点内容\n4. 实践练习建议\n5. 评估方式', '系统化的课程设计模板，适用于各类在线教育内容', 'education', true),
  
  ('投资分析报告模板', '请分析以下投资标的并生成报告：\n\n投资标的：[股票/基金/项目名称]\n分析维度：[基本面/技术面/市场环境]\n投资期限：[短期/中期/长期]\n\n分析要点：\n1. 基本面分析\n2. 风险评估\n3. 收益预期\n4. 投资建议\n5. 风险提示', '专业的投资分析框架，帮助做出理性投资决策', 'finance', true),
  
  ('AI绘画提示词优化器', '请优化以下AI绘画提示词：\n\n原始提示词：[原始描述]\n绘画风格：[写实/动漫/油画/水彩等]\n画面重点：[人物/风景/物品等]\n\n优化要求：\n1. 增加具体的视觉细节\n2. 添加艺术风格描述\n3. 包含光影和色彩指导\n4. 提供负面提示词建议', '专业的AI绘画提示词优化工具，提升图像生成质量', 'image', true),
  
  ('短视频脚本创作助手', '请为以下内容创作短视频脚本：\n\n视频主题：[主题内容]\n视频时长：[30秒/60秒/3分钟]\n目标平台：[抖音/小红书/B站等]\n目标观众：[年龄段和兴趣]\n\n脚本要素：\n1. 开头吸引注意力的钩子\n2. 主要内容展示\n3. 互动引导语\n4. 结尾行动召唤\n5. 配音和字幕建议', '专业的短视频脚本模板，提升视频传播效果', 'video', true)
ON CONFLICT DO NOTHING;