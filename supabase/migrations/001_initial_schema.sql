-- Enable RLS (Row Level Security)
-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('ecommerce', 'education', 'finance', 'images', 'video')),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt_tags junction table
CREATE TABLE IF NOT EXISTS public.prompt_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(prompt_id, tag_id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Prompts policies
CREATE POLICY "Public prompts are viewable by everyone" ON public.prompts
  FOR SELECT USING (is_public = true OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can insert prompts" ON public.prompts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can update their own prompts" ON public.prompts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own prompts" ON public.prompts
  FOR DELETE USING (auth.uid() = author_id);

-- Tags policies
CREATE POLICY "Tags are viewable by everyone" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert tags" ON public.tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Prompt_tags policies
CREATE POLICY "Prompt tags are viewable by everyone" ON public.prompt_tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage prompt tags" ON public.prompt_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Favorites policies
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;

GRANT SELECT ON public.prompts TO anon, authenticated;
GRANT ALL ON public.prompts TO authenticated;

GRANT SELECT ON public.tags TO anon, authenticated;
GRANT ALL ON public.tags TO authenticated;

GRANT SELECT ON public.prompt_tags TO anon, authenticated;
GRANT ALL ON public.prompt_tags TO authenticated;

GRANT SELECT ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_category ON public.prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_author ON public.prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_prompt ON public.favorites(prompt_id);

-- Insert some default tags
INSERT INTO public.tags (name, color) VALUES
  ('AI助手', '#3b82f6'),
  ('创意写作', '#10b981'),
  ('商业策略', '#f59e0b'),
  ('教育培训', '#8b5cf6'),
  ('图像生成', '#ef4444'),
  ('视频制作', '#06b6d4'),
  ('数据分析', '#84cc16'),
  ('营销推广', '#f97316')
ON CONFLICT (name) DO NOTHING;