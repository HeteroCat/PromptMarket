import React, { useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import PromptGrid from '../components/PromptGrid';
import SearchBar, { SearchFilters } from '../components/SearchBar';
import { usePrompts } from '../contexts/PromptContext';

const FinancePage: React.FC = () => {
  const { prompts, loading, searchPrompts, fetchPrompts, fetchFeaturedPromptsByCategory } = usePrompts();

  useEffect(() => {
    fetchFeaturedPromptsByCategory('finance');
  }, [fetchFeaturedPromptsByCategory]);

  const handleSearch = (query: string, filters: SearchFilters) => {
    const searchFilters = {
      ...filters,
      category: 'finance'
    };
    
    if (query.trim() || Object.values(filters).some(v => v && v !== '')) {
      searchPrompts(query, searchFilters);
    } else {
      fetchFeaturedPromptsByCategory('finance');
    }
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-r from-yellow-500/10 to-orange-600/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center mr-6">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">金融提示词</h1>
              <p className="text-gray-300 text-lg">投资分析、风险评估、财务报告等金融相关提示词</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="搜索金融提示词..."
            showFilters={true}
            categories={[
              { value: '', label: '全部子分类' },
              { value: 'investment-analysis', label: '投资分析' },
              { value: 'risk-assessment', label: '风险评估' },
              { value: 'financial-report', label: '财务报告' },
              { value: 'market-research', label: '市场研究' },
              { value: 'trading-strategy', label: '交易策略' }
            ]}
          />
        </div>
      </section>

      {/* Prompts Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">金融提示词模板</h2>
              <p className="text-gray-400">
                {loading ? '加载中...' : `共找到 ${prompts.length} 个提示词`}
              </p>
            </div>
          </div>

          <PromptGrid 
            prompts={prompts} 
            loading={loading}
            showAuthor={true}
          />
        </div>
      </section>
    </Layout>
  );
};

export default FinancePage;