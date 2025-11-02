import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import Layout from '../components/Layout';
import PromptGrid from '../components/PromptGrid';
import SearchBar, { SearchFilters } from '../components/SearchBar';
import { usePrompts } from '../contexts/PromptContext';

const EcommercePage: React.FC = () => {
  const { prompts, loading, error, searchPrompts, fetchPrompts, fetchFeaturedPromptsByCategory } = usePrompts();

  useEffect(() => {
    fetchFeaturedPromptsByCategory('ecommerce');
  }, [fetchFeaturedPromptsByCategory]);

  const handleSearch = (query: string, filters: SearchFilters) => {
    const searchFilters = {
      ...filters,
      category: 'ecommerce'
    };
    
    if (query.trim() || Object.values(filters).some(v => v && v !== '')) {
      searchPrompts(query, searchFilters);
    } else {
      fetchFeaturedPromptsByCategory('ecommerce');
    }
  };

  const subcategories = [
    { value: '', label: '全部' },
    { value: 'product-description', label: '产品描述' },
    { value: 'marketing-copy', label: '营销文案' },
    { value: 'ad-creative', label: '广告创意' },
    { value: 'email-marketing', label: '邮件营销' },
    { value: 'social-media', label: '社交媒体' }
  ];

  const difficulties = [
    { value: '', label: '全部难度' },
    { value: 'beginner', label: '初级' },
    { value: 'intermediate', label: '中级' },
    { value: 'advanced', label: '高级' }
  ];

  const sortOptions = [
    { value: 'created_at', label: '最新发布' },
    { value: 'usage_count', label: '使用次数' },
    { value: 'rating', label: '评分' }
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-6">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">电商提示词</h1>
              <p className="text-gray-300 text-lg">产品描述、营销文案、广告创意等电商相关提示词</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="搜索电商提示词..."
            showFilters={true}
            categories={[
              { value: '', label: '全部子分类' },
              { value: 'product-description', label: '产品描述' },
              { value: 'marketing', label: '营销文案' },
              { value: 'advertising', label: '广告创意' },
              { value: 'social-media', label: '社交媒体' }
            ]}
          />
        </div>
      </section>

      {/* Prompts Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">电商提示词模板</h2>
              <p className="text-gray-400">
                {loading ? '加载中...' : `共找到 ${prompts.length} 个提示词`}
              </p>
            </div>
          </div>

          <PromptGrid 
            prompts={prompts} 
            loading={loading}
            error={error}
            showAuthor={true}
            onRetry={() => fetchPrompts('ecommerce')}
          />
        </div>
      </section>
    </Layout>
  );
};

export default EcommercePage;