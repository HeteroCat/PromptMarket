import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { usePrompts } from '../contexts/PromptContext';
import { useToast } from '../components/ToastContainer';

const CreatePrompt: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { user } = useAuth();
  const { createPrompt, updatePrompt, fetchPromptById, tags, fetchTags } = usePrompts();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'ecommerce' as 'ecommerce' | 'education' | 'finance' | 'image' | 'video',
    tags: [] as string[],
    usage_instructions: '',
    example_output: '',
    is_public: true,
    is_featured: false
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchTags();
    
    if (editId) {
      fetchPromptById(editId).then(prompt => {
        if (prompt) {
          setFormData({
            title: prompt.title,
            description: prompt.description || '',
            content: prompt.content,
            category: prompt.category,
            tags: [], // prompt.tags || [], // 暂时设为空数组，因为数据库结构可能不同
            usage_instructions: prompt.usage_instructions || '',
            example_output: prompt.example_output || '',
            is_public: prompt.is_public,
            is_featured: prompt.is_featured
          });
        }
      });
    }
  }, [editId, fetchPromptById, fetchTags]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('请先登录');
      setLoading(false);
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('标题和内容不能为空');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (editId) {
        result = await updatePrompt(editId, formData);
        if (result.error) {
          throw result.error;
        }
        showSuccess('更新成功', '提示词已成功更新');
      } else {
        result = await createPrompt(formData);
        if (result.error) {
          throw result.error;
        }
        showSuccess('创建成功', '提示词已成功创建');
      }
      navigate('/profile');
    } catch (err: any) {
      const errorMessage = err.message || '保存失败，请稍后重试';
      setError(errorMessage);
      showError('保存失败', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">请先登录</h2>
            <p className="text-gray-400 mb-6">您需要登录才能创建提示词</p>
            <button
              onClick={() => navigate('/login')}
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
    { value: 'ecommerce', label: '电商' },
    { value: 'education', label: '教育' },
    { value: 'finance', label: '金融' },
    { value: 'image', label: '图片' },
    { value: 'video', label: '视频' }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>
          <h1 className="text-3xl font-bold text-white">
            {editId ? '编辑提示词' : '创建提示词'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">基本信息</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  标题 *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入提示词标题"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  分类 *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                描述
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="简要描述这个提示词的用途和特点"
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">提示词内容</h2>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                内容 *
              </label>
              <textarea
                id="content"
                name="content"
                rows={12}
                required
                value={formData.content}
                onChange={handleChange}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="输入完整的提示词内容..."
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">标签</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-300 hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入标签名称"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>添加</span>
              </button>
            </div>

            {tags.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">常用标签：</p>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 10).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(tag.name)) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag.name]
                          }));
                        }
                      }}
                      className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">附加信息</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="usage_instructions" className="block text-sm font-medium text-gray-300 mb-2">
                  使用说明
                </label>
                <textarea
                  id="usage_instructions"
                  name="usage_instructions"
                  rows={4}
                  value={formData.usage_instructions}
                  onChange={handleChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="说明如何使用这个提示词，包括参数替换、注意事项等"
                />
              </div>

              <div>
                <label htmlFor="example_output" className="block text-sm font-medium text-gray-300 mb-2">
                  示例输出
                </label>
                <textarea
                  id="example_output"
                  name="example_output"
                  rows={6}
                  value={formData.example_output}
                  onChange={handleChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="提供一个使用这个提示词的示例输出"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>{editId ? '更新中...' : '创建中...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editId ? '更新' : '创建'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePrompt;