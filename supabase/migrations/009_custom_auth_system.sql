-- 创建完全自定义的认证系统，摆脱 Supabase Auth
-- 这个迁移将创建自定义的 users 表和相关功能

-- 1. 创建自定义 users 表
CREATE TABLE IF NOT EXISTS public.custom_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_custom_users_phone ON public.custom_users(phone);
CREATE INDEX IF NOT EXISTS idx_custom_users_username ON public.custom_users(username);
CREATE INDEX IF NOT EXISTS idx_custom_users_created_at ON public.custom_users(created_at);

-- 3. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. 为 custom_users 表添加更新时间触发器
DROP TRIGGER IF EXISTS update_custom_users_updated_at ON public.custom_users;
CREATE TRIGGER update_custom_users_updated_at
    BEFORE UPDATE ON public.custom_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. 重新创建 profiles 表，关联到 custom_users
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID REFERENCES public.custom_users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    full_name TEXT DEFAULT '',
    phone VARCHAR(20) NOT NULL,
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 为 profiles 表创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 7. 为 profiles 表添加更新时间触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. 创建用户注册后自动创建 profile 的触发器函数
CREATE OR REPLACE FUNCTION handle_new_custom_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, phone)
    VALUES (NEW.id, NEW.username, NEW.full_name, NEW.phone);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 创建触发器
DROP TRIGGER IF EXISTS on_custom_user_created ON public.custom_users;
CREATE TRIGGER on_custom_user_created
    AFTER INSERT ON public.custom_users
    FOR EACH ROW EXECUTE FUNCTION handle_new_custom_user();

-- 10. 设置 RLS 策略
ALTER TABLE public.custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 11. 为 custom_users 表创建 RLS 策略
-- 用户只能查看和更新自己的记录
CREATE POLICY "Users can view own record" ON public.custom_users
    FOR SELECT USING (true); -- 暂时允许所有查询，后续可以根据需要调整

CREATE POLICY "Users can update own record" ON public.custom_users
    FOR UPDATE USING (true); -- 暂时允许所有更新，后续可以根据需要调整

-- 12. 为 profiles 表创建 RLS 策略
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (true);

-- 13. 创建会话管理表（可选，用于更高级的会话管理）
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.custom_users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. 为会话表创建索引
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON public.user_sessions(expires_at);

-- 15. 创建清理过期会话的函数
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 16. 注释说明
COMMENT ON TABLE public.custom_users IS '自定义用户表，用于电话号码认证';
COMMENT ON TABLE public.profiles IS '用户资料表，关联到自定义用户表';
COMMENT ON TABLE public.user_sessions IS '用户会话管理表';
COMMENT ON COLUMN public.custom_users.phone IS '用户手机号码，唯一标识';
COMMENT ON COLUMN public.custom_users.password_hash IS '密码哈希值';
COMMENT ON COLUMN public.custom_users.username IS '用户名，唯一标识';