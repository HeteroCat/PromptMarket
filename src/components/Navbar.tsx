import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/ecommerce', label: '电商' },
    { path: '/education', label: '教育' },
    { path: '/finance', label: '金融' },
    { path: '/images', label: '图片' },
    { path: '/videos', label: '视频' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/25">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:block group-hover:text-blue-300 transition-colors duration-300">PromptMarket</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                  isActive(link.path)
                    ? 'text-blue-400 bg-blue-400/10 shadow-sm shadow-blue-500/20'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800 hover:scale-105'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive(link.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                )}
              </Link>
            ))}
          </div>



          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-sm hover:shadow-blue-500/20"
                  title="个人主页"
                >
                  <User className="w-5 h-5" />
                </Link>

                <Link
                  to="/create"
                  className="p-2 text-gray-300 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-sm hover:shadow-green-500/20"
                  title="创建提示词"
                >
                  <Plus className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-sm hover:shadow-red-500/20"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  注册
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-800">


              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile User Menu */}
              {user && (
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    个人主页
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    我的收藏
                  </Link>
                  <Link
                    to="/create"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    创建提示词
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;