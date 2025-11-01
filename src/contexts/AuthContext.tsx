import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PageLoader from '../components/PageLoader';
import bcrypt from 'bcryptjs';

// 自定义用户类型
interface CustomUser {
  id: string;
  phone: string;
  username: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_login?: string;
}

// 用户资料类型
interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: CustomUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (phone: string, password: string, username?: string, fullName?: string) => Promise<{ error: any; message?: string }>;
  signIn: (phone: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: { username?: string; full_name?: string; avatar_url?: string; bio?: string }) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 电话号码格式验证
const validatePhone = (phone: string): boolean => {
  // 支持中国大陆手机号格式：1开头的11位数字
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 生成随机会话令牌
const generateSessionToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// 会话存储键
const SESSION_STORAGE_KEY = 'custom_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 从本地存储加载会话
  const loadSession = async () => {
    try {
      const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionData) {
        const { userId, sessionToken, expiresAt } = JSON.parse(sessionData);
        
        // 检查会话是否过期
        if (new Date(expiresAt) > new Date()) {
          // 从数据库验证用户
          const { data: userData, error: userError } = await supabase
            .from('custom_users')
            .select('*')
            .eq('id', userId)
            .eq('is_active', true)
            .single();

          if (!userError && userData) {
            setUser(userData);
            
            // 加载用户资料
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            
            if (profileData) {
              setProfile(profileData);
            }
          } else {
            // 清除无效会话
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        } else {
          // 清除过期会话
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  // 保存会话到本地存储
  const saveSession = (userId: string) => {
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天后过期
    
    const sessionData = {
      userId,
      sessionToken,
      expiresAt: expiresAt.toISOString()
    };
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  };

  // 清除会话
  const clearSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    loadSession();
  }, []);

  const signUp = async (phone: string, password: string, username?: string, fullName?: string) => {
    try {
      console.log('Starting user registration with phone:', phone);
      
      // 验证电话号码格式
      if (!validatePhone(phone)) {
        return { 
          error: { message: '请输入有效的手机号码（11位数字，以1开头）' }
        };
      }

      // 验证密码长度
      if (password.length < 6) {
        return {
          error: { message: '密码长度至少为6位' }
        };
      }

      // 生成默认用户名
      const finalUsername = username || `user_${phone.slice(-4)}`;
      const finalFullName = fullName || '';

      // 检查手机号是否已存在
      const { data: existingUser } = await supabase
        .from('custom_users')
        .select('id')
        .eq('phone', phone)
        .single();

      if (existingUser) {
        return {
          error: { message: '该手机号已被注册' }
        };
      }

      // 检查用户名是否已存在
      const { data: existingUsername } = await supabase
        .from('custom_users')
        .select('id')
        .eq('username', finalUsername)
        .single();

      if (existingUsername) {
        return {
          error: { message: '用户名已存在，请选择其他用户名' }
        };
      }

      // 哈希密码
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 创建用户
      const { data: newUser, error: createError } = await supabase
        .from('custom_users')
        .insert({
          phone,
          password_hash: passwordHash,
          username: finalUsername,
          full_name: finalFullName,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('User creation error:', createError);
        return { error: { message: '注册失败，请稍后重试' } };
      }

      console.log('User created successfully:', newUser);

      // 设置用户状态
      setUser(newUser);
      
      // 保存会话
      saveSession(newUser.id);

      // 用户资料会通过数据库触发器自动创建，我们需要获取它
      setTimeout(async () => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newUser.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }, 100);

      return { error: null, message: '注册成功！' };
    } catch (error) {
      console.error('Unexpected error during registration:', error);
      return { error: { message: '注册过程中发生错误，请稍后重试' } };
    }
  };

  const signIn = async (phone: string, password: string) => {
    try {
      console.log('Starting user login with phone:', phone);
      
      // 验证电话号码格式
      if (!validatePhone(phone)) {
        return { 
          error: { message: '请输入有效的手机号码' }
        };
      }

      // 查找用户
      const { data: userData, error: userError } = await supabase
        .from('custom_users')
        .select('*')
        .eq('phone', phone)
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        return {
          error: { message: '手机号或密码错误' }
        };
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
      
      if (!isPasswordValid) {
        return {
          error: { message: '手机号或密码错误' }
        };
      }

      // 更新最后登录时间
      await supabase
        .from('custom_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      // 设置用户状态
      setUser(userData);
      
      // 保存会话
      saveSession(userData.id);

      // 加载用户资料
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      console.log('Login successful');
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during login:', error);
      return { error: { message: '登录过程中发生错误，请稍后重试' } };
    }
  };

  const signOut = async () => {
    try {
      clearSession();
      console.log('User signed out successfully');
      return { error: null };
    } catch (error) {
      console.error('Error during sign out:', error);
      return { error };
    }
  };

  const updateProfile = async (updates: { username?: string; full_name?: string; avatar_url?: string; bio?: string }) => {
    try {
      if (!user) {
        return { error: { message: '用户未登录' } };
      }

      // 如果更新用户名，需要检查是否已存在
      if (updates.username && updates.username !== user.username) {
        const { data: existingUsername } = await supabase
          .from('custom_users')
          .select('id')
          .eq('username', updates.username)
          .neq('id', user.id)
          .single();

        if (existingUsername) {
          return {
            error: { message: '用户名已存在，请选择其他用户名' }
          };
        }

        // 更新 custom_users 表中的用户名
        await supabase
          .from('custom_users')
          .update({ username: updates.username })
          .eq('id', user.id);
      }

      // 更新 profiles 表
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (!error) {
        // 重新加载用户数据
        const { data: updatedUser } = await supabase
          .from('custom_users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (updatedUser) setUser(updatedUser);
        if (updatedProfile) setProfile(updatedProfile);
      }

      return { error };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <PageLoader /> : children}
    </AuthContext.Provider>
  );
};