import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ppihakeiwovmulcywqkl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwaWhha2Vpd292bXVsY3l3cWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NjMwNzMsImV4cCI6MjA2NTAzOTA3M30.v_IjBHvUDVVh-S2J2zqSRX9AEIEgdh0W2rprais2JmU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export type CustomUser = Database['public']['Tables']['custom_users']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Prompt = Database['public']['Tables']['prompts']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
export interface Database {
  public: {
    Tables: {
      custom_users: {
        Row: {
          id: string
          phone: string
          password_hash: string
          username: string
          full_name: string | null
          created_at: string | null
          updated_at: string | null
          is_active: boolean | null
          last_login: string | null
        }
        Insert: {
          id?: string
          phone: string
          password_hash: string
          username: string
          full_name?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
          last_login?: string | null
        }
        Update: {
          id?: string
          phone?: string
          password_hash?: string
          username?: string
          full_name?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
          last_login?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          phone: string
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          phone: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          phone?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          title: string
          content: string
          description: string | null
          category: 'ecommerce' | 'education' | 'finance' | 'image' | 'video'
          author_id: string | null
          is_public: boolean
          is_featured: boolean
          usage_count: number
          like_count: number
          usage_instructions: string | null
          example_output: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          description?: string | null
          category: 'ecommerce' | 'education' | 'finance' | 'image' | 'video'
          author_id?: string | null
          is_public?: boolean
          is_featured?: boolean
          usage_count?: number
          like_count?: number
          usage_instructions?: string | null
          example_output?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          description?: string | null
          category?: 'ecommerce' | 'education' | 'finance' | 'image' | 'video'
          author_id?: string | null
          is_public?: boolean
          is_featured?: boolean
          usage_count?: number
          like_count?: number
          usage_instructions?: string | null
          example_output?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prompt_tags: {
        Row: {
          id: string
          prompt_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          prompt_id: string
          tag_id: string
        }
        Update: {
          id?: string
          prompt_id?: string
          tag_id?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          prompt_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_id?: string
          created_at?: string
        }
      }
    }
  }
}