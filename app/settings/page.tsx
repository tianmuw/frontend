// app/settings/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, accessToken, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 状态管理 ---
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // 密码修改状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 消息提示
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 初始化预览图
  useEffect(() => {
    if (user?.avatar) {
      setPreviewUrl(user.avatar);
    }
  }, [user]);

  // 路由保护
  useEffect(() => {
    // 简单检查，如果未登录则跳转
    // 实际项目中可以用更稳健的 loading 状态检查
    const timer = setTimeout(() => {
        if (!user && !accessToken) router.push('/login');
    }, 1000);
    return () => clearTimeout(timer);
  }, [user, accessToken, router]);

  if (!user) return <div className="p-10 text-center">加载中...</div>;

  // --- 处理函数 1: 修改头像 ---
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file)); // 本地预览
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatar) return; // 如果没选新头像，就不提交

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('avatar', avatar);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // 调用 PATCH /users/me/ 更新资料
      await axios.patch(`${apiUrl}/api/v1/auth/users/me/`, formData, {
        headers: { 
            Authorization: `JWT ${accessToken}`,
            // axios 会自动设置 multipart/form-data
        }
      });

      setMessage({ text: '头像更新成功！刷新页面可见最新效果。', type: 'success' });
      // 可以在这里调用 fetchCurrentUser() 来刷新全局状态，但简单的做法是提示用户
    } catch (err) {
      console.error(err);
      setMessage({ text: '头像更新失败，请重试。', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // --- 处理函数 2: 修改密码 ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ text: '两次输入的新密码不一致！', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // 调用 set_password 接口
      await axios.post(
        `${apiUrl}/api/v1/auth/users/set_password/`,
        {
            current_password: currentPassword,
            new_password: newPassword,
            re_new_password: confirmPassword
        },
        { headers: { Authorization: `JWT ${accessToken}` } }
      );

      setMessage({ text: '密码修改成功！请重新登录。', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // 密码修改后，通常 Token 会失效，强制注销是个好习惯
      setTimeout(() => {
          logout();
      }, 2000);

    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.current_password) {
          setMessage({ text: '当前密码错误。', type: 'error' });
      } else {
          setMessage({ text: '密码修改失败，请检查输入。', type: 'error' });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">用户设置</h1>

      {/* 全局消息提示 */}
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* 模块 1: 个人资料 (头像) */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
          个人资料
        </h2>
        
        <form onSubmit={handleProfileUpdate} className="flex flex-col sm:flex-row items-center gap-8">
           {/* 头像预览区域 */}
           <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden mb-3">
                  {previewUrl ? (
                      <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                          {user.username[0].toUpperCase()}
                      </div>
                  )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                更换头像
              </button>
              {/* 隐藏的文件输入框 */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
              />
           </div>

           {/* 用户名展示 (不可修改) */}
           <div className="flex-1 w-full space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <input 
                    type="text" 
                    value={user.username} 
                    disabled 
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">用户名注册后不可修改。</p>
              </div>

              <div className="flex justify-end">
                 <button 
                    type="submit"
                    disabled={uploading || !avatar}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                    {uploading ? '上传中...' : '保存资料'}
                 </button>
              </div>
           </div>
        </form>
      </div>

      {/* 模块 2: 安全设置 (修改密码) */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
          安全设置
        </h2>
        
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div className="pt-2">
                <button 
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                    {passwordLoading ? '修改中...' : '修改密码'}
                </button>
            </div>
        </form>
      </div>

    </div>
  );
}