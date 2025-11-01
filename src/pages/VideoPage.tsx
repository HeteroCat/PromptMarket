import React, { useEffect } from 'react';
import { Video } from 'lucide-react';
import Layout from '../components/Layout';
import PromptGrid from '../components/PromptGrid';
import SearchBar, { SearchFilters } from '../components/SearchBar';
import { usePrompts } from '../contexts/PromptContext';

const VideoPage: React.FC = () => {
  const { prompts, loading, searchPrompts, fetchPrompts } = usePrompts();

  useEffect(() => {
    fetchPrompts('video');
  }, [fetchPrompts]);

  const handleSearch = (query: string, filters: SearchFilters) => {
    const searchFilters = {
      ...filters,
      category: 'video'
    };
    
    if (query.trim() || Object.values(filters).some(v => v && v !== '')) {
      searchPrompts(query, searchFilters);
    } else {
      fetchPrompts('video');
    }
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-r from-red-500/10 to-pink-600/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center mr-6">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">视频生成提示词</h1>
              <p className="text-gray-300 text-lg">AI视频、动画制作、视频脚本等视频生成提示词</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="搜索视频生成提示词..."
            showFilters={true}
            categories={[
              { value: '', label: '全部子分类' },
              { value: 'ai-video', label: 'AI视频' },
              { value: 'animation', label: '动画制作' },
              { value: 'video-script', label: '视频脚本' },
              { value: 'motion-graphics', label: '动态图形' },
              { value: 'video-editing', label: '视频剪辑' },
              { value: 'storyboard', label: '故事板' }
            ]}
          />
        </div>
      </section>

      {/* Prompts Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">视频生成提示词模板</h2>
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

export default VideoPage;