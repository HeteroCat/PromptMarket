import React, { useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import Layout from '../components/Layout';
import PromptGrid from '../components/PromptGrid';
import SearchBar, { SearchFilters } from '../components/SearchBar';
import { usePrompts } from '../contexts/PromptContext';

const EducationPage: React.FC = () => {
  const { prompts, loading, searchPrompts, fetchPrompts, fetchFeaturedPromptsByCategory } = usePrompts();

  useEffect(() => {
    fetchFeaturedPromptsByCategory('education');
  }, [fetchFeaturedPromptsByCategory]);

  const handleSearch = (query: string, filters: SearchFilters) => {
    const searchFilters = {
      ...filters,
      category: 'education'
    };
    
    if (query.trim() || Object.values(filters).some(v => v && v !== '')) {
      searchPrompts(query, searchFilters);
    } else {
      fetchFeaturedPromptsByCategory('education');
    }
  };

  const subcategories = [
    { value: '', label: '全部' },
    { value: 'lesson-planning', label: '课程规划' },
    { value: 'quiz-generation', label: '题目生成' },
    { value: 'explanation', label: '知识解释' },
    { value: 'study-guide', label: '学习指导' },
    { value: 'assessment', label: '评估测试' }
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
      <section className="bg-gradient-to-r from-blue-500/10 to-indigo-600/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">教育提示词</h1>
              <p className="text-gray-300 text-lg">课程规划、题目生成、知识解释等教育相关提示词</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="搜索教育提示词..."
            showFilters={true}
            categories={[
              { value: '', label: '全部子分类' },
              { value: 'lesson-planning', label: '课程规划' },
              { value: 'quiz-generation', label: '题目生成' },
              { value: 'explanation', label: '知识解释' },
              { value: 'study-guide', label: '学习指导' },
              { value: 'assessment', label: '评估测试' }
            ]}
          />
        </div>
      </section>

      {/* Prompts Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">教育提示词模板</h2>
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

export default EducationPage;