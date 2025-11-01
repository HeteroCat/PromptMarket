import React, { useEffect, useState } from 'react';
import { Heart, Search, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import PromptGrid from '../components/PromptGrid';
import { useAuth } from '../contexts/AuthContext';
import { usePrompts } from '../contexts/PromptContext';

const Favorites: React.FC = () => {
  const { user } = useAuth();
  const { prompts, loading, fetchUserFavorites } = usePrompts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'created_at'
  });

  useEffect(() => {
    if (user) {
      fetchUserFavorites(user.id);
    }
  }, [user, fetchUserFavorites]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里可以添加搜索逻辑
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // 这里可以添加实际的筛选逻辑
  };

  // 过滤和搜索逻辑
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !filters.category || prompt.category === filters.category;
    
    return matchesSearch && matchesCategory;
  });

  // 排序逻辑
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'created_at':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">请先登录</h2>
            <p className="text-gray-400 mb-6">您需要登录才能查看收藏的提示词</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              去登录
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const categories = [
    { value: '', label: '全部分类' },
    { value: 'ecommerce', label: '电商' },
    { value: 'education', label: '教育' },
    { value: 'finance', label: '金融' },
    { value: 'images', label: '图片' },
    { value: 'videos', label: '视频' }
  ];

  const sortOptions = [
    { value: 'created_at', label: '收藏时间' },
    { value: 'title', label: '标题' },
    { value: 'category', label: '分类' }
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-r from-red-500/10 to-pink-600/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center mr-6">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">我的收藏</h1>
              <p className="text-gray-300 text-lg">
                {loading ? '加载中...' : `共收藏了 ${sortedPrompts.length} 个提示词`}
              </p>
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
                  placeholder="搜索收藏的提示词..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">分类</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map(option => (
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

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {sortedPrompts.length > 0 ? (
            <PromptGrid 
              prompts={sortedPrompts} 
              loading={loading}
              showAuthor={true}
            />
          ) : (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {searchQuery || filters.category ? '没有找到匹配的收藏' : '还没有收藏'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filters.category 
                  ? '尝试调整搜索条件或筛选器' 
                  : '浏览提示词并收藏您喜欢的内容！'
                }
              </p>
              {!searchQuery && !filters.category && (
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  浏览提示词
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Favorites;