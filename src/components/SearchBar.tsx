import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
  initialFilters?: SearchFilters;
  categories?: Array<{ value: string; label: string }>;
}

export interface SearchFilters {
  category?: string;
  difficulty?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "搜索提示词...",
  showFilters = true,
  initialFilters = {},
  categories = [
    { value: '', label: '全部分类' },
    { value: 'ecommerce', label: '电商' },
    { value: 'education', label: '教育' },
    { value: 'finance', label: '金融' },
    { value: 'images', label: '图片' },
    { value: 'videos', label: '视频' }
  ]
}) => {
  const [query, setQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // 热门搜索建议
  const popularSearches = [
    '电商文案',
    '产品描述',
    '营销策略',
    '教学设计',
    '图片生成',
    '视频脚本'
  ];

  // 从localStorage加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      // 添加到搜索历史
      const newHistory = [finalQuery, ...searchHistory.filter(item => item !== finalQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
    
    onSearch(finalQuery, filters);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0 || searchHistory.length > 0);
  };

  const handleInputFocus = () => {
    setShowSuggestions(query.length > 0 || searchHistory.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(query, newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    onSearch(query, clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  const difficultyOptions = [
    { value: '', label: '全部难度' },
    { value: 'beginner', label: '初级' },
    { value: 'intermediate', label: '中级' },
    { value: 'advanced', label: '高级' }
  ];

  const sortOptions = [
    { value: 'created_at', label: '创建时间' },
    { value: 'title', label: '标题' },
    { value: 'rating', label: '评分' },
    { value: 'usage_count', label: '使用次数' }
  ];

  return (
    <div className="w-full" ref={searchRef}>
      {/* 搜索栏 */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 max-w-2xl relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => handleSearch()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition-colors text-sm font-medium"
            >
              搜索
            </button>
          </div>

          {/* 搜索建议 */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
              {/* 搜索历史 */}
              {searchHistory.length > 0 && (
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>搜索历史</span>
                    </div>
                    <button
                      onClick={clearSearchHistory}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      清除
                    </button>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 热门搜索 */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span>热门搜索</span>
                </div>
                <div className="space-y-1">
                  {popularSearches.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors border ${
                hasActiveFilters || showFilterPanel
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                  : 'bg-gray-800/50 hover:bg-gray-700/50 text-white border-gray-700/50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>筛选</span>
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {Object.values(filters).filter(v => v && v !== '').length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span>清除</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 筛选面板 */}
      {showFilters && showFilterPanel && (
        <div className="mt-6 p-6 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 分类筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">分类</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* 难度筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">难度</label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* 排序方式 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">排序方式</label>
              <select
                value={filters.sortBy || 'created_at'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* 排序顺序 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">排序顺序</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;