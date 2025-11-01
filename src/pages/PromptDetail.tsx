import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Copy, 
  Heart, 
  Edit3, 
  Trash2, 
  User, 
  Calendar, 
  Tag, 
  Star,
  ArrowLeft,
  Check
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { usePrompts } from '../contexts/PromptContext';
import { useToast } from '../components/ToastContainer';
import { Prompt } from '../lib/supabase';

const PromptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchPromptById, deletePrompt, isFavorited, addToFavorites, removeFromFavorites } = usePrompts();
  const { showSuccess, showError } = useToast();
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadPrompt = async () => {
      if (id) {
        try {
          setLoading(true);
          setError(null);
          const promptData = await fetchPromptById(id);
          if (promptData) {
            setPrompt(promptData);
          } else {
            setError('提示词不存在或已被删除');
          }
        } catch (err) {
          console.error('Error loading prompt:', err);
          setError('加载提示词失败，请稍后重试');
        } finally {
          setLoading(false);
        }
      }
    };

    loadPrompt();
  }, [id, fetchPromptById]);

  const handleCopy = async () => {
    if (prompt) {
      try {
        await navigator.clipboard.writeText(prompt.content);
        setCopied(true);
        showSuccess('复制成功', '提示词内容已复制到剪贴板');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('复制失败:', error);
        showError('复制失败', '无法复制到剪贴板，请手动复制');
      }
    }
  };

  const handleFavorite = async () => {
    if (prompt && user) {
      try {
        const isCurrentlyFavorited = isFavorited(prompt.id);
        if (isCurrentlyFavorited) {
          await removeFromFavorites(prompt.id);
          showSuccess('取消收藏', '已从收藏夹中移除');
        } else {
          await addToFavorites(prompt.id);
          showSuccess('收藏成功', '已添加到收藏夹');
        }
      } catch (error) {
        console.error('收藏操作失败:', error);
        showError('操作失败', '收藏操作失败，请稍后重试');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/create?edit=${id}`);
  };

  const handleDelete = async () => {
    if (prompt && window.confirm('确定要删除这个提示词吗？此操作不可撤销。')) {
      try {
        await deletePrompt(prompt.id);
        showSuccess('删除成功', '提示词已成功删除');
        navigate('/profile');
      } catch (error) {
        console.error('删除失败:', error);
        showError('删除失败', '删除提示词失败，请稍后重试');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded mb-8"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !prompt) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-red-400 text-xl mb-4">
              {error || '提示词不存在'}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isOwner = user?.id === prompt.author_id;
  const isPromptFavorited = isFavorited(prompt.id);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl p-8 mb-8 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-4">{prompt.title}</h1>
              <p className="text-gray-300 mb-6">{prompt.description}</p>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>匿名用户</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(prompt.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="capitalize">{prompt.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>{prompt.like_count || 0} 点赞</span>
                </div>
              </div>

              {/* Category Badge */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm capitalize">
                  {prompt.category}
                </span>
                {prompt.is_featured && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                    精选
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '已复制' : '复制'}</span>
              </button>

              {user && (
                <button
                  onClick={handleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isPromptFavorited
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isPromptFavorited ? 'fill-current' : ''}`} />
                  <span>{isPromptFavorited ? '已收藏' : '收藏'}</span>
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>编辑</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeleting ? '删除中...' : '删除'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">提示词内容</h2>
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/30">
            <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {prompt.content}
            </pre>
          </div>
        </div>

        {/* Additional Description */}
        {prompt.description && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">详细说明</h2>
            <div className="text-gray-300 whitespace-pre-wrap">
              {prompt.description}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-white">{prompt.usage_count || 0}</div>
            <div className="text-sm text-gray-400">使用次数</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-white">{prompt.like_count || 0}</div>
            <div className="text-sm text-gray-400">点赞数</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-white">{prompt.is_featured ? '是' : '否'}</div>
            <div className="text-sm text-gray-400">精选状态</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-white">
              {new Date(prompt.created_at).toLocaleDateString('zh-CN')}
            </div>
            <div className="text-sm text-gray-400">创建日期</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PromptDetail;