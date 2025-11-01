import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, GraduationCap, DollarSign, Image, Video, ArrowRight, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import PromptGrid from '../components/PromptGrid';
import SearchBar, { SearchFilters } from '../components/SearchBar';
import { usePrompts } from '../contexts/PromptContext';

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { prompts, loading, error, searchPrompts, fetchPrompts, fetchFeaturedPrompts } = usePrompts();
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    // 获取精选提示词（限制数量）
    if (searchParams.get('search')) {
      // 如果有搜索参数，使用搜索功能
      setIsSearchMode(true);
      searchPrompts(searchParams.get('search') || '', {});
    } else {
      // 否则获取精选提示词
      setIsSearchMode(false);
      fetchFeaturedPrompts(6);
    }
  }, [fetchFeaturedPrompts, searchPrompts, searchParams]);

  const handleSearch = (query: string, filters: SearchFilters) => {
    if (query.trim() || Object.values(filters).some(v => v && v !== '')) {
      setIsSearchMode(true);
      searchPrompts(query, filters);
    } else {
      setIsSearchMode(false);
      fetchFeaturedPrompts(6);
    }
  };

  const categories = [
    {
      id: 'ecommerce',
      name: '电商',
      description: '产品描述、营销文案、广告创意',
      icon: ShoppingBag,
      color: 'from-green-500 to-emerald-600',
      path: '/ecommerce'
    },
    {
      id: 'education',
      name: '教育',
      description: '课程设计、教学辅助、学习指导',
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600',
      path: '/education'
    },
    {
      id: 'finance',
      name: '金融',
      description: '投资分析、风险评估、财务报告',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-600',
      path: '/finance'
    },
    {
      id: 'images',
      name: '图片',
      description: '图像生成、视觉设计、艺术创作',
      icon: Image,
      color: 'from-purple-500 to-pink-600',
      path: '/images'
    },
    {
      id: 'videos',
      name: '视频',
      description: '视频脚本、故事板、动画创意',
      icon: Video,
      color: 'from-red-500 to-rose-600',
      path: '/videos'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%234f46e5%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        {/* 动态光效 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* 浮动元素 */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-20 w-2 h-2 bg-blue-300/40 rounded-full animate-bounce delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-blue-400 mr-3 animate-spin-slow" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-fade-in">
              PromptMarket
            </h1>
            <Sparkles className="w-6 h-6 text-purple-400 ml-3 animate-pulse" />
          </div>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            发现、分享和创建高质量的AI提示词模板
          </p>
          
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            为创作者、营销人员、教育工作者提供专业的提示词资源，提升AI使用效率和创作质量
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <SearchBar
              onSearch={handleSearch}
              placeholder="搜索提示词、分类或关键词..."
              showFilters={true}
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">探索分类</h2>
            <p className="text-gray-400 text-lg">选择您感兴趣的领域，发现专业的提示词模板</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={category.path}
                  className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 group-hover:shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-all duration-300 group-hover:translate-x-1">
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                    <span>探索更多</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-500`}></div>
                  
                  {/* 光效动画 */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Prompts Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {isSearchMode ? '搜索结果' : '精选提示词'}
              </h2>
              <p className="text-gray-400 text-lg">
                {isSearchMode 
                  ? `找到 ${prompts.length} 个相关提示词`
                  : '发现热门和推荐的高质量提示词模板'
                }
              </p>
            </div>
            
            {!isSearchMode && (
              <Link
                to="/ecommerce"
                className="hidden sm:flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <span>查看全部</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>

          <PromptGrid 
            prompts={prompts} 
            loading={loading}
            error={error}
            showAuthor={true}
            onRetry={() => {
              if (isSearchMode) {
                searchPrompts(searchParams.get('search') || '', {});
              } else {
                fetchFeaturedPrompts(6);
              }
            }}
          />

          {!loading && prompts.length > 0 && !isSearchMode && (
            <div className="text-center mt-12">
              <Link
                to="/ecommerce"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 group"
              >
                <span>探索更多提示词</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Home;