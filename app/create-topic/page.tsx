// app/create-topic/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function CreateTopicPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<File | null>(null); // (!!) 新增：存储文件
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<File | null>(null);

  const { accessToken, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // (!!) 关键：构建 FormData 对象 (!!)
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (icon) {
        formData.append('icon', icon); // 添加文件
      }
      if (banner) {
        formData.append('banner', banner);
      }

      await axios.post(
        `${apiUrl}/api/v1/topics/`,
        formData, // 发送 FormData
        {
          headers: {
            Authorization: `JWT ${accessToken}`,
            // axios 会自动检测 FormData 并设置 'Content-Type': 'multipart/form-data'
          }
        }
      );

      router.push('/');
    } catch (err: any) {
      console.error(err);
      // 简单的错误处理，如果后端返回 name already exists
      if (err.response?.data?.name) {
        setError(`创建失败: ${err.response.data.name[0]}`);
      } else {
        setError('创建话题失败，请重试。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return <div className="p-8 text-center">请先登录...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mt-8 border border-gray-200">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">创建新的社区 (Topic)</h1>
      <p className="text-gray-500 mb-6 text-sm">创建一个属于你的兴趣圈子，并上传一个酷炫的图标。</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 话题名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">话题名称</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">t/</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如: 数码评测"
              required
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">名称一旦创建不可修改。</p>
        </div>

        {/* 简介 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="描述一下这个话题是关于什么的..."
          />
        </div>

        {/* (!!) 新增：图片上传 (!!) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">社区图标 (可选)</label>
          <div className="mt-1 flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setIcon(e.target.files[0]);
                }
              }}
              className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                    "
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">话题背景图 (Banner)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setBanner(e.target.files[0])}
            className="..."
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? '创建中...' : '创建话题'}
          </button>
        </div>
      </form>
    </div>
  );
}