// app/register/page.tsx (支持头像上传版)
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null); // (!!) 新增头像状态
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth(); 
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('两次输入的密码不一致！');
      return;
    }
    
    setIsLoading(true);

    try {
      // 1. (!!) 构建 FormData (!!)
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      // 2. 注册 (此时 axios 会自动设置 multipart/form-data)
      await axios.post(`${apiUrl}/api/v1/auth/users/`, formData);

      // 3. 自动登录 (登录接口还是用 JSON)
      const loginResponse = await axios.post(`${apiUrl}/api/v1/auth/jwt/create/`, {
        username,
        password,
      });

      if (loginResponse.data.access) {
        login(loginResponse.data.access, loginResponse.data.refresh);
        router.push('/');
      }

    } catch (err: any) {
      console.error('Registration failed', err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        let errorMessages = [];
        // Djoser 的错误格式可能是一个对象，key 是字段名
        Object.keys(errorData).forEach(key => {
            const msgs = errorData[key];
            if (Array.isArray(msgs)) {
                errorMessages.push(`${key}: ${msgs[0]}`);
            } else {
                errorMessages.push(msgs);
            }
        });
        
        if (errorMessages.length > 0) {
          setError(errorMessages.join(' | '));
        } else {
          setError('注册失败，请重试。');
        }
      } else {
        setError('注册失败，请重试。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">创建新账号</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 头像上传 */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">头像 (可选)</label>
             <div className="flex items-center space-x-4">
                {/* 预览图 (如果有) */}
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                    {avatar ? (
                        <img src={URL.createObjectURL(avatar)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-gray-400 text-xl">👤</span>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && setAvatar(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="设置一个昵称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="再次输入密码"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? '注册中...' : '注册并登录'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          已有账号？{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            直接登录
          </Link>
        </p>
      </div>
    </div>
  );
}