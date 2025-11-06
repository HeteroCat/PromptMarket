import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Prompt, Tag, Favorite } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface PromptContextType {
  prompts: Prompt[];
  userPrompts: Prompt[];
  userFavoritePrompts: Prompt[];
  favorites: Favorite[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
  
  // 提示词相关方法
  fetchPrompts: (category?: string, search?: string, limit?: number) => Promise<void>;
  fetchFeaturedPrompts: (limit?: number) => Promise<void>;
  fetchFeaturedPromptsByCategory: (category: string, limit?: number) => Promise<void>;
  fetchPromptById: (id: string) => Promise<Prompt | null>;
  createPrompt: (prompt: Omit<Prompt, 'id' | 'author_id' | 'created_at' | 'updated_at' | 'usage_count' | 'like_count'> & { tags?: string[] }) => Promise<{ error: any }>;
  updatePrompt: (id: string, updates: Partial<Prompt> & { tags?: string[] }) => Promise<{ error: any }>;
  deletePrompt: (id: string) => Promise<{ error: any }>;
  
  // 搜索和筛选方法
  searchPrompts: (query: string, filters?: {
    category?: string;
    difficulty?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<void>;
  fetchUserPrompts: (userId: string) => Promise<void>;
  fetchUserFavorites: (userId: string) => Promise<void>;
  
  // 收藏相关方法
  fetchFavorites: () => Promise<void>;
  addToFavorites: (promptId: string) => Promise<{ error: any }>;
  removeFromFavorites: (promptId: string) => Promise<{ error: any }>;
  isFavorited: (promptId: string) => boolean;
  
  // 标签相关方法
  fetchTags: (promptId?: string) => Promise<Tag[]>;
  addTag: (promptId: string, name: string, color?: string) => Promise<{ error: any }>;
  removeTag: (tagId: string) => Promise<{ error: any }>;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const usePrompts = () => {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptProvider');
  }
  return context;
};

export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([]);
  const [userFavoritePrompts, setUserFavoritePrompts] = useState<Prompt[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(data || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [user]);

  // 当用户登录后自动加载收藏数据
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      // 用户登出时清空收藏数据
      setFavorites([]);
    }
  }, [user, fetchFavorites]);

  const fetchPrompts = useCallback(async (category?: string, search?: string, limit?: number) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('prompts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPrompts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching prompts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedPrompts = useCallback(async (limit?: number) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('prompts')
        .select('*')
        .eq('is_public', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPrompts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching featured prompts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedPromptsByCategory = useCallback(async (category: string, limit?: number) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('prompts')
        .select('*')
        .eq('is_public', true)
        .eq('is_featured', true)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPrompts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching featured prompts by category:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPromptById = useCallback(async (id: string): Promise<Prompt | null> => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error fetching prompt:', err);
      return null;
    }
  }, []);

  const createPrompt = useCallback(async (prompt: Omit<Prompt, 'id' | 'author_id' | 'created_at' | 'updated_at' | 'usage_count' | 'like_count'> & { tags?: string[] }) => {
    try {
      if (!user) return { error: new Error('User not authenticated') };

      console.log('✨ Creating prompt with user ID:', user.id);
      console.log('📝 Prompt data:', prompt);

      // 从prompt对象中提取tags，其余字段用于插入prompts表
      const { tags, ...promptData } = prompt;

      const { data, error } = await supabase
        .from('prompts')
        .insert([
          {
            ...promptData,
            author_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Prompt created successfully:', data);

      // 如果有标签，插入到prompt_tags表
      if (tags && tags.length > 0) {
        console.log('🏷️ Inserting tags:', tags);
        
        // 首先获取或创建标签
        for (const tagName of tags) {
          // 检查标签是否已存在
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single();

          let tagId = existingTag?.id;

          // 如果标签不存在，创建新标签
          if (!tagId) {
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert([{ name: tagName, color: '#3B82F6' }])
              .select('id')
              .single();

            if (tagError) {
              console.error('❌ Error creating tag:', tagError);
              continue;
            }
            tagId = newTag.id;
          }

          // 插入到prompt_tags关联表
          const { error: linkError } = await supabase
            .from('prompt_tags')
            .insert([{
              prompt_id: data.id,
              tag_id: tagId
            }]);

          if (linkError) {
            console.error('❌ Error linking tag to prompt:', linkError);
          }
        }
      }

      // 更新本地状态
      setPrompts(prev => [data, ...prev]);

      return { error: null };
    } catch (error) {
      console.error('❌ Error creating prompt:', error);
      return { error };
    }
  }, [user]);

  const updatePrompt = useCallback(async (id: string, updates: Partial<Prompt> & { tags?: string[] }) => {
    try {
      // 从updates中提取tags，其余字段用于更新prompts表
      const { tags, ...promptUpdates } = updates;

      const { data, error } = await supabase
        .from('prompts')
        .update(promptUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 如果有标签更新，处理标签关联
      if (tags !== undefined) {
        console.log('🏷️ Updating tags for prompt:', id, tags);
        
        // 首先删除现有的标签关联
        await supabase
          .from('prompt_tags')
          .delete()
          .eq('prompt_id', id);

        // 如果有新标签，添加标签关联
        if (tags && tags.length > 0) {
          for (const tagName of tags) {
            // 检查标签是否已存在
            const { data: existingTag } = await supabase
              .from('tags')
              .select('id')
              .eq('name', tagName)
              .single();

            let tagId = existingTag?.id;

            // 如果标签不存在，创建新标签
            if (!tagId) {
              const { data: newTag, error: tagError } = await supabase
                .from('tags')
                .insert([{ name: tagName }])
                .select()
                .single();

              if (tagError) throw tagError;
              tagId = newTag.id;
            }

            // 插入到prompt_tags关联表
            await supabase
              .from('prompt_tags')
              .insert([{ prompt_id: id, tag_id: tagId }]);
          }
        }
      }

      // 更新本地状态
      setPrompts(prev => prev.map(p => p.id === id ? data : p));
      setUserPrompts(prev => prev.map(p => p.id === id ? data : p));

      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  const deletePrompt = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 更新本地状态
      setPrompts(prev => prev.filter(p => p.id !== id));

      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  const addToFavorites = useCallback(async (promptId: string) => {
    try {
      if (!user) return { error: new Error('User not authenticated') };

      const { data, error } = await supabase
        .from('favorites')
        .insert([
          {
            user_id: user.id,
            prompt_id: promptId,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // 更新本地状态
      setFavorites(prev => [...prev, data]);

      return { error: null };
    } catch (error) {
      return { error };
    }
  }, [user]);

  const removeFromFavorites = useCallback(async (promptId: string) => {
    try {
      if (!user) return { error: new Error('User not authenticated') };

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('prompt_id', promptId);

      if (error) throw error;

      // 更新本地状态
      setFavorites(prev => prev.filter(f => f.prompt_id !== promptId));

      return { error: null };
    } catch (error) {
      return { error };
    }
  }, [user]);

  const isFavorited = useCallback((promptId: string) => {
    return favorites.some(f => f.prompt_id === promptId);
  }, [favorites]);

  const fetchTags = useCallback(async (promptId?: string): Promise<Tag[]> => {
    try {
      let query = supabase.from('prompt_tags').select('*');
      
      if (promptId) {
        query = query.eq('prompt_id', promptId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const tagsData = data || [];
      setTags(tagsData);
      return tagsData;
    } catch (err) {
      console.error('Error fetching tags:', err);
      return [];
    }
  }, []);

  const addTag = useCallback(async (promptId: string, name: string, color = '#3B82F6') => {
    try {
      const { data, error } = await supabase
        .from('prompt_tags')
        .insert([
          {
            prompt_id: promptId,
            name,
            color,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  const removeTag = useCallback(async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('prompt_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  // 搜索和筛选方法
  const searchPrompts = useCallback(async (query: string, filters?: {
    category?: string;
    difficulty?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      setLoading(true);
      setError(null);

      let supabaseQuery = supabase
        .from('prompts')
        .select('*')
        .eq('is_public', true)
        .eq('is_featured', true);

      // 搜索查询
      if (query) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`);
      }

      // 分类筛选
      if (filters?.category) {
        supabaseQuery = supabaseQuery.eq('category', filters.category);
      }

      // 难度筛选
      if (filters?.difficulty) {
        supabaseQuery = supabaseQuery.eq('difficulty', filters.difficulty);
      }

      // 排序
      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder === 'asc' ? true : false;
      supabaseQuery = supabaseQuery.order(sortBy, { ascending: sortOrder });

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      setPrompts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error searching prompts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserPrompts = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 fetchUserPrompts called with userId:', userId);

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📊 fetchUserPrompts result:', {
        userId,
        promptsCount: data?.length || 0,
        prompts: data
      });

      setUserPrompts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('❌ Error fetching user prompts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserFavorites = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('❤️ fetchUserFavorites called with userId:', userId);

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          prompts (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 提取收藏的提示词
      const favoritePrompts = data?.map(fav => fav.prompts).filter(Boolean) || [];
      
      console.log('💖 fetchUserFavorites result:', {
        userId,
        favoritesCount: data?.length || 0,
        favoritePromptsCount: favoritePrompts.length,
        favorites: data,
        favoritePrompts
      });

      setUserFavoritePrompts(favoritePrompts);
      setFavorites(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('❌ Error fetching user favorites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    prompts,
    userPrompts,
    userFavoritePrompts,
    favorites,
    tags,
    loading,
    error,
    fetchPrompts,
    fetchFeaturedPrompts,
    fetchFeaturedPromptsByCategory,
    fetchPromptById,
    createPrompt,
    updatePrompt,
    deletePrompt,
    searchPrompts,
    fetchUserPrompts,
    fetchUserFavorites,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    fetchTags,
    addTag,
    removeTag,
  };

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  );
};