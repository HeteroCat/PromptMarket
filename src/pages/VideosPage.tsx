import React, { useEffect, useState } from 'react';
import { Video, Filter, Search } from 'lucide-react';
import Layout from '../components/Layout';
import PromptGrid from '../components/PromptGrid';
import { usePrompts } from '../contexts/PromptContext';

const VideosPage: React.FC = () => {
  const { prompts, loading, fetchPrompts } = usePrompts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    subcategory: '',
    difficulty: '',
    sortBy: 'created_at'
  });

  useEffect(() => {
    fetchPrompts('video');
  }, [fetchPrompts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrompts('video', searchQuery.trim() || undefined);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // 这里可以添加实际的筛选逻辑
  };

  const subcategories = [
    { value: '', label: '全部' },
    { value: 'script-writing', label: '脚本编写' },
    { value: 'video-editing', label: '视频剪辑' },
    { value: 'content-planning', label: '内容策划' },
    { value: 'animation', label: '动画制作' },
    { value: 'video-analysis', label: '视频分析' }
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
      <section className="bg-gradient-to-r from-red-500/10 to-rose-600/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center mr-6">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">视频提示词</h1>
              <p className="text-gray-300 text-lg">脚本编写、视频剪辑、内容策划等视频相关提示词</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索视频提示词..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md transition-colors text-sm font-medium"
                >
                  搜索
                </button>
              </div>
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-3 rounded-lg transition-colors border border-gray-700/50"
            >
              <Filter className="w-4 h-4" />
              <span>筛选</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">子分类</label>
                  <select
                    value={filters.subcategory}
                    onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {subcategories.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">难度等级</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {difficulties.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">排序方式</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Prompts Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">视频提示词模板</h2>
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

export default VideosPage;