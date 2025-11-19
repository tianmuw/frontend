// app/settings/page.tsx (包含隐私设置版)
'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ApiUser } from '@/types';

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

  // (!!!) 隐私设置状态 (!!!)
  const [privacySettings, setPrivacySettings] = useState({
    is_followers_public: true,
    is_following_public: true,
    is_joined_topics_public: true,
    is_created_topics_public: true,
  });
  const [privacyLoading, setPrivacyLoading] = useState(false);

  // 消息提示
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 初始化数据
  useEffect(() => {
    const timer = setTimeout(() => {
        if (!user && !accessToken) router.push('/login');
    }, 1000);

    if (user) {
        if (user.avatar) setPreviewUrl(user.avatar);
        // (!!!) 初始化隐私状态 (如果 user 中有这些字段) (!!!)
        setPrivacySettings({
            is_followers_public: user.is_followers_public ?? true,
            is_following_public: user.is_following_public ?? true,
            is_joined_topics_public: user.is_joined_topics_public ?? true,
            is_created_topics_public: user.is_created_topics_public ?? true,
        });
    }
    return () => clearTimeout(timer);
  }, [user, accessToken, router]);

  if (!user) return <div className="p-10 text-center">加载中...</div>;

  // --- 处理函数 1: 修改头像 ---
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatar) return;
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('avatar', avatar);
      await axios.patch(`${apiUrl}/api/v1/auth/users/me/`, formData, {
        headers: { Authorization: `JWT ${accessToken}` }
      });
      setMessage({ text: '头像更新成功！刷新页面可见最新效果。', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: '头像更新失败。', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // --- 处理函数 2: 修改隐私 ---
  const togglePrivacy = async (key: keyof typeof privacySettings) => {
      const newValue = !privacySettings[key];
      // 乐观更新
      setPrivacySettings(prev => ({ ...prev, [key]: newValue }));
      setPrivacyLoading(true);
      setMessage(null);
      
      try {
          await axios.patch(`${apiUrl}/api/v1/auth/users/me/`, {
              [key]: newValue
          }, {
              headers: { Authorization: `JWT ${accessToken}` }
          });
          // 成功不提示，失败才提示，体验更好
      } catch (err) {
          console.error(err);
          setMessage({ text: '隐私设置更新失败。', type: 'error' });
          // 回滚
          setPrivacySettings(prev => ({ ...prev, [key]: !newValue }));
      } finally {
          setPrivacyLoading(false);
      }
  };

  // --- 处理函数 3: 修改密码 ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ text: '两次输入的新密码不一致！', type: 'error' });
      return;
    }
    setPasswordLoading(true);
    try {
      await axios.post(
        `${apiUrl}/api/v1/auth/users/set_password/`,
        { current_password: currentPassword, new_password: newPassword, re_new_password: confirmPassword },
        { headers: { Authorization: `JWT ${accessToken}` } }
      );
      setMessage({ text: '密码修改成功！请重新登录。', type: 'success' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => { logout(); }, 2000);
    } catch (err: any) {
      setMessage({ text: '密码修改失败。', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // 开关组件 (Helper Component)
  const Switch = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <span className="text-gray-700 text-sm font-medium">{label}</span>
        <button 
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
            <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
        </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">用户设置</h1>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* 1. 个人资料 */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">个人资料</h2>
        <form onSubmit={handleProfileUpdate} className="flex flex-col sm:flex-row items-center gap-8">
           <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden mb-3">
                  {previewUrl ? <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">{user.username[0].toUpperCase()}</div>}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-600 hover:underline font-medium">更换头像</button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
           </div>
           <div className="flex-1 w-full space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <input type="text" value={user.username} disabled className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div className="flex justify-end">
                 <button type="submit" disabled={uploading || !avatar} className="bg-blue-600 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">{uploading ? '上传中...' : '保存资料'}</button>
              </div>
           </div>
        </form>
      </div>

      {/* (!!!) 2. 隐私设置 (新增模块) (!!!) */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">隐私设置</h2>
        <div className="space-y-1">
            <Switch 
                label="允许其他人查看我的粉丝列表" 
                checked={privacySettings.is_followers_public} 
                onChange={() => togglePrivacy('is_followers_public')} 
            />
            <Switch 
                label="允许其他人查看我关注的人" 
                checked={privacySettings.is_following_public} 
                onChange={() => togglePrivacy('is_following_public')} 
            />
            <Switch 
                label="允许其他人查看我加入的话题" 
                checked={privacySettings.is_joined_topics_public} 
                onChange={() => togglePrivacy('is_joined_topics_public')} 
            />
            {/* <Switch 
                label="允许其他人查看我创建的话题" 
                checked={privacySettings.is_created_topics_public} 
                onChange={() => togglePrivacy('is_created_topics_public')} 
            /> 
            */}
        </div>
      </div>

      {/* 3. 安全设置 */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">安全设置</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none" />
            </div>
            <div className="pt-2">
                <button type="submit" disabled={passwordLoading} className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-700 disabled:opacity-50 transition-colors">{passwordLoading ? '修改中...' : '修改密码'}</button>
            </div>
        </form>
      </div>
    </div>
  );
}