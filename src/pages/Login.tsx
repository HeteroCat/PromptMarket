import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { useToast } from '../components/ToastContainer';
import Ballpit from '../components/Ballpit';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 电话号码格式验证
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.phone || !formData.password) {
      setError('请填写所有必填字段');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('请输入有效的手机号码');
      return;
    }

    try {
      const { error } = await signIn(formData.phone, formData.password);
      if (error) {
        setError(error.message || '登录失败，请检查您的手机号码和密码');
        showError(error.message || '登录失败，请检查您的手机号码和密码');
      } else {
        showSuccess('登录成功！');
        navigate('/');
      }
    } catch (err: any) {
      const errorMessage = err.message || '登录失败，请检查您的手机号码和密码';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ballpit 背景 */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Ballpit 
            count={100}
            gravity={0.1}
            friction={0.985}
            wallBounce={0.95}
           
            colors={[0xffffff, 0x9ca3af, 0x8b5cf6, 0x3b82f6]}
          />
        </div>
        {/* 登录表单 */}
        <div className="max-w-md w-full space-y-8 relative z-20">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              登录您的账户
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              或者{' '}
              <Link
                to="/register"
                className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                创建新账户
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* 手机号码输入 */}
              <div>
                <label htmlFor="phone" className="sr-only">
                  手机号码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <Phone className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:z-10 sm:text-sm"
                    placeholder="手机号码"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* 密码输入 */}
              <div>
                <label htmlFor="password" className="sr-only">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <Lock className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:z-10 sm:text-sm"
                    placeholder="密码"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 bg-gray-800 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  记住我
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-purple-400 hover:text-purple-300">
                  忘记密码？
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    登录中...
                  </div>
                ) : (
                  '登录'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;