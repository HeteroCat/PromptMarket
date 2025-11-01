-- 修复 RLS 策略以允许用户注册时创建 profile
-- 解决 "new row violates row-level security policy for table profiles" 错误

-- 首先删除现有的 profiles 表 RLS 策略
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- 重新创建更宽松的 RLS 策略
-- 1. 允许所有人查看公开的 profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- 2. 允许认证用户插入自己的 profile（关键修复）
-- 使用 auth.uid() 来匹配当前认证用户的 ID
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. 允许用户更新自己的 profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. 允许用户删除自己的 profile（可选）
CREATE POLICY "Users can delete their own profile" 
ON profiles FOR DELETE 
USING (auth.uid() = id);

-- 确保 profiles 表启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 重新授予必要的权限
GRANT SELECT ON profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- 创建一个函数来处理新用户注册后自动创建 profile（可选的备用方案）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name, avatar_url, bio)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    ''
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器，在新用户注册时自动创建 profile（可选的备用方案）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 注释：这个触发器是备用方案，如果 AuthContext.tsx 中的手动插入仍然有问题，
-- 可以依赖这个触发器自动创建 profile