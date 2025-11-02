import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { useToast } from '../components/ToastContainer';
import Ballpit from '../components/Ballpit';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // Validation
    if (!formData.phone || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError('请填写所有必填字段');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('请输入有效的手机号码（11位数字，以1开头）');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    try {
      const { error, message } = await signUp(
        formData.phone,
        formData.password,
        formData.username,
        formData.fullName
      );

      if (error) {
        setError(error.message || '注册失败，请重试');
        showError(error.message || '注册失败，请重试');
      } else {
        showSuccess(message || '注册成功！');
        navigate('/login');
      }
    } catch (err) {
      setError('注册过程中发生错误');
      showError('注册过程中发生错误');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ballpit 背景 */}
        <div className="absolute inset-0 z-0">
          <Ballpit 
            count={100}
            gravity={0.1}
            friction={0.985}
            wallBounce={0.95}
          
            colors={[0xffffff, 0x9ca3af, 0x8b5cf6, 0x3b82f6]}
          />
        </div>
        
       
        
        {/* 注册表单 */}
        <div className="max-w-md w-full space-y-8 relative z-20">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              创建新账户
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              或者{' '}
              <Link
                to="/login"
                className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                登录现有账户
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

              {/* 姓名输入 */}
              <div>
                <label htmlFor="fullName" className="sr-only">
                  姓名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <User className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:z-10 sm:text-sm"
                    placeholder="姓名"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* 用户名输入（可选） */}
              <div>
                <label htmlFor="username" className="sr-only">
                  用户名（可选）
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <User className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:z-10 sm:text-sm"
                    placeholder="用户名（可选）"
                    value={formData.username}
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
                    autoComplete="new-password"
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

              {/* 确认密码输入 */}
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  确认密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                    <Lock className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:z-10 sm:text-sm"
                    placeholder="确认密码"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    注册中...
                  </div>
                ) : (
                  '创建账户'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400">
                注册即表示您同意我们的{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  服务条款
                </a>{' '}
                和{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  隐私政策
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Register;