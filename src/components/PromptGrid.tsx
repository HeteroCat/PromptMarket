import React from 'react';
import { Prompt } from '../contexts/PromptContext';
import TiltedCard from './TiltedCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface PromptGridProps {
  prompts: Prompt[];
  loading?: boolean;
  className?: string;
  showAuthor?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const PromptGrid: React.FC<PromptGridProps> = ({ 
  prompts, 
  loading = false, 
  className = '',
  showAuthor = false,
  error = null,
  onRetry
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded-full w-20 mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                  <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage
          title="加载失败"
          message={error}
          onRetry={onRetry}
          className="max-w-md mx-auto"
        />
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/30 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-3">暂无提示词</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            还没有找到符合条件的提示词<br />
            试试调整搜索条件或创建一个新的提示词吧！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {prompts.map((prompt) => (
        <TiltedCard 
          key={prompt.id} 
          prompt={prompt} 
          showAuthor={showAuthor}
        />
      ))}
    </div>
  );
};

export default PromptGrid;