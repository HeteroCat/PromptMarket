-- 最终修复 RLS 策略问题
-- 解决 "new row violates row-level security policy for table profiles" 错误

-- 删除所有现有的 profiles 表 RLS 策略
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- 暂时禁用 RLS 以清理状态
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 重新启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建新的 RLS 策略
-- 1. 允许所有人查看 profiles（用于公开显示）
CREATE POLICY "Enable read access for all users" 
ON profiles FOR SELECT 
USING (true);

-- 2. 允许认证用户插入自己的 profile
-- 使用更宽松的策略确保注册时能成功插入
CREATE POLICY "Enable insert for authenticated users based on user_id" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 3. 允许用户更新自己的 profile
CREATE POLICY "Enable update for users based on user_id" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 4. 允许用户删除自己的 profile
CREATE POLICY "Enable delete for users based on user_id" 
ON profiles FOR DELETE 
TO authenticated 
USING (auth.uid() = id);

-- 确保正确的权限设置
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- 重新创建 handle_new_user 函数（改进版本）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name, avatar_url, bio)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'bio', '')
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- 如果插入失败，记录错误但不阻止用户注册
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- 重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();