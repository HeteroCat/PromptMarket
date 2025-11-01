-- 将 profiles 表的 email 字段改为 phone 字段
-- 支持电话号码注册而不是邮箱注册

-- 1. 添加 phone 字段
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- 2. 将现有的 email 数据迁移到 phone 字段（如果需要保留数据）
-- UPDATE public.profiles SET phone = email WHERE phone IS NULL;

-- 3. 删除 email 字段
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS email;

-- 4. 添加 phone 字段的唯一约束
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);

-- 5. 更新 handle_new_user 函数以使用 phone 而不是 email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    phone,
    avatar_url,
    bio,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.phone, 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 记录错误但不阻止用户创建
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 更新 RLS 策略以使用 phone 字段
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- 创建新的 RLS 策略
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- 7. 添加注释
COMMENT ON COLUMN public.profiles.phone IS '用户电话号码，用于登录和联系';
COMMENT ON CONSTRAINT profiles_phone_unique ON public.profiles IS '确保电话号码唯一性';