import React, { useEffect, useState } from 'react';
import { User, Edit3, Heart, FileText, Calendar, Phone, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PromptGrid from '../components/PromptGrid';
import { useAuth } from '../contexts/AuthContext';
import { usePrompts } from '../contexts/PromptContext';
import { useToast } from '../components/ToastContainer';

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { prompts, userPrompts, userFavoritePrompts, loading, fetchUserPrompts, fetchUserFavorites } = usePrompts();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'created' | 'favorites'>('created');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || '',
    bio: profile?.bio || ''
  });

  useEffect(() => {
    if (user) {
      console.log('👤 Profile useEffect - Current user:', user);
      console.log('📋 Profile useEffect - Active tab:', activeTab);
      
      if (activeTab === 'created') {
        console.log('🔄 Fetching user prompts for user ID:', user.id);
        fetchUserPrompts(user.id);
      } else {
        console.log('❤️ Fetching user favorites for user ID:', user.id);
        fetchUserFavorites(user.id);
      }
    }
  }, [user, activeTab, fetchUserPrompts, fetchUserFavorites]);

  // 更新编辑表单数据
  useEffect(() => {
    setEditForm({
      full_name: profile?.full_name || profile?.username || user?.full_name || user?.username || '',
      bio: profile?.bio || ''
    });
  }, [user, profile]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      showSuccess('更新成功', '个人资料已成功更新');
    } catch (error) {
      console.error('更新个人资料失败:', error);
      showError('更新失败', '更新个人资料失败，请稍后重试');
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">请先登录</h2>
            <p className="text-gray-400">您需要登录才能查看个人主页</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 使用正确的数据源
  const displayPrompts = activeTab === 'created' ? userPrompts : userFavoritePrompts;
  
  console.log('📊 Profile render - Display data:', {
    activeTab,
    userPromptsCount: userPrompts.length,
    userFavoritePromptsCount: userFavoritePrompts.length,
    displayPromptsCount: displayPrompts.length,
    userPrompts,
    userFavoritePrompts,
    displayPrompts
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl p-8 mb-8 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User className="w-12 h-12 text-white" />
            </div>

            {/* User Info */}
            <div className="flex-1">
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="full_name"
                      value={editForm.full_name}
                      onChange={handleEditChange}
                      placeholder="姓名"
                      className="text-2xl font-bold bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleEditChange}
                      placeholder="个人简介"
                      rows={3}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {profile?.full_name || profile?.username || user?.full_name || user?.username || '未设置姓名'}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-300 mb-4">
                    {profile?.bio || '这个人很懒，什么都没有留下...'}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>加入于 {new Date(user.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 lg:flex-col lg:items-end">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userPrompts.length}</div>
                <div className="text-sm text-gray-400">创作</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userFavoritePrompts.length}</div>
                <div className="text-sm text-gray-400">收藏</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-8 border border-gray-700/50">
          <button
            onClick={() => setActiveTab('created')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === 'created'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>我的创作</span>
            <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">
              {userPrompts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === 'favorites'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>我的收藏</span>
            <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">
              {userFavoritePrompts.length}
            </span>
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'created' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">我的创作</h2>
                <button 
                  onClick={() => navigate('/create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>创建新提示词</span>
                </button>
              </div>
              
              {displayPrompts.length > 0 ? (
                <PromptGrid 
                  prompts={displayPrompts} 
                  loading={loading}
                  showAuthor={false}
                />
              ) : (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">还没有创作</h3>
                  <p className="text-gray-500 mb-6">开始创建您的第一个提示词模板吧！</p>
                  <button 
                    onClick={() => navigate('/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    创建提示词
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">我的收藏</h2>
              </div>
              
              {userFavoritePrompts.length > 0 ? (
                <PromptGrid 
                  prompts={userFavoritePrompts} 
                  loading={loading}
                  showAuthor={true}
                />
              ) : (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">还没有收藏</h3>
                  <p className="text-gray-500 mb-6">浏览提示词并收藏您喜欢的内容！</p>
                  <button 
                    onClick={() => navigate('/')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    浏览提示词
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;