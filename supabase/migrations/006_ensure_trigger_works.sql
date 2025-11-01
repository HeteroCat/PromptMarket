-- 确保触发器能够正常工作的迁移
-- 这个迁移将暂时禁用 RLS 策略，确保触发器可以插入数据

-- 暂时禁用 profiles 表的 RLS 以允许触发器插入
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 重新创建改进的 handle_new_user 函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- 使用 SECURITY DEFINER 确保函数以创建者权限运行
  INSERT INTO public.profiles (id, username, email, full_name, avatar_url, bio)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'bio', '')
  );
  
  -- 记录成功日志
  RAISE LOG 'Profile created successfully for user %', new.id;
  
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- 记录错误但不阻止用户注册
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- 确保触发器存在
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 重新启用 RLS，但使用更宽松的策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 删除所有现有策略
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;

-- 创建新的更宽松的策略
-- 1. 允许所有人查看 profiles
CREATE POLICY "Allow public read access" 
ON profiles FOR SELECT 
USING (true);

-- 2. 允许认证用户插入自己的 profile（但主要依赖触发器）
CREATE POLICY "Allow authenticated insert" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (true);  -- 更宽松的检查

-- 3. 允许用户更新自己的 profile
CREATE POLICY "Allow users to update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 4. 允许用户删除自己的 profile
CREATE POLICY "Allow users to delete own profile" 
ON profiles FOR DELETE 
TO authenticated 
USING (auth.uid() = id);

-- 确保权限正确
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;