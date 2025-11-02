import React, { useState } from 'react';
// import Tilt from 'react-tilt';
import { Heart, Star, Copy, Eye, User, Check } from 'lucide-react';
import { Prompt } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePrompts } from '../contexts/PromptContext';
import { Link } from 'react-router-dom';
import { useToast } from './ToastContainer';

interface TiltedCardProps {
  prompt: Prompt;
  showAuthor?: boolean;
  className?: string;
}

const TiltedCard: React.FC<TiltedCardProps> = ({ 
  prompt, 
  showAuthor = true, 
  className = '' 
}) => {
  const { user } = useAuth();
  const { isFavorited, addToFavorites, removeFromFavorites } = usePrompts();
  const { showSuccess, showError } = useToast();
  const [copied, setCopied] = useState(false);

  // 格式化日期函数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1天前';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}周前`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}个月前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // 可以在这里添加提示用户登录的逻辑
      return;
    }

    if (isFavorited(prompt.id)) {
      await removeFromFavorites(prompt.id);
    } else {
      await addToFavorites(prompt.id);
    }
  };

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      showSuccess('复制成功', '提示词内容已复制到剪贴板');
      
      // 2秒后重置复制状态
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('复制失败:', error);
      showError('复制失败', '无法复制到剪贴板，请手动复制');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      ecommerce: 'from-green-500 to-emerald-600',
      education: 'from-blue-500 to-indigo-600',
      finance: 'from-yellow-500 to-orange-600',
      images: 'from-purple-500 to-pink-600',
      videos: 'from-red-500 to-rose-600',
      image: 'from-purple-500 to-pink-600',
      video: 'from-red-500 to-rose-600',
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      ecommerce: '电商',
      education: '教育',
      finance: '金融',
      images: '图片',
      videos: '视频',
      image: '图片',
      video: '视频',
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className={`tilt-card ${className}`}>
      <Link
      to={`/prompt/${prompt.id}`}
      className="group block bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/20 relative overflow-hidden"
    >
      {/* 背景光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="h-full relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getCategoryColor(prompt.category)} text-white transition-all duration-300`}>
                  {getCategoryLabel(prompt.category)}
                </span>
                {prompt.like_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-400">{prompt.like_count}</span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 transition-all duration-300 line-clamp-2">
                {prompt.title}
              </h3>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={handleCopyClick}
                className={`flex items-center gap-1 transition-all duration-300 p-2 rounded-lg ${
                  copied 
                    ? 'text-green-400 bg-green-500/10' 
                    : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700/50'
                }`}
                title="复制内容"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              {user && (
                <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isFavorited(prompt.id)
                  ? 'text-red-400 hover:text-red-300 bg-red-400/10'
                  : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
              }`}
              title={isFavorited(prompt.id) ? '取消收藏' : '收藏'}
            >
              <Heart className={`w-4 h-4 transition-all duration-300 ${isFavorited(prompt.id) ? 'fill-current' : ''}`} />
            </button>
              )}
            </div>
          </div>

          {/* Description */}
          {prompt.description && (
            <p className="text-gray-300 text-sm mb-4 line-clamp-3 transition-colors duration-300">
              {prompt.description}
            </p>
          )}

          {/* Content Preview */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm line-clamp-3 font-mono">
              {prompt.content}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-700/50 transition-colors duration-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 transition-colors duration-300">
                <Eye className="w-3 h-3" />
                {prompt.usage_count || 0}
              </span>
              <span className="flex items-center gap-1 transition-colors duration-300">
                <Heart className="w-3 h-3" />
                {prompt.like_count || 0}
              </span>
            </div>
            <span className="transition-colors duration-300">{formatDate(prompt.created_at)}</span>
          </div>

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </Link>
    </div>
  );
};

export default TiltedCard;