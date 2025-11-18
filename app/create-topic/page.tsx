// app/create-topic/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function CreateTopicPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { accessToken, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(
        `${apiUrl}/api/v1/topics/`,
        { name, description },
        { headers: { Authorization: `JWT ${accessToken}` } }
      );
      // 创建成功，回到首页 (或者跳转到新话题页)
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('创建话题失败，可能是名称已存在。');
    }
  };

  if (!isAuthenticated) return <div className="p-8">请先登录...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mt-4">
      <h1 className="text-2xl font-bold mb-4">创建一个新话题 (t/)</h1>
      <p className="text-gray-500 mb-6">话题是社区的核心。创建一个属于你的兴趣圈子。</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">话题名称</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="例如: 数码评测"
            required
          />
          <p className="text-xs text-gray-400 mt-1">将会显示为 t/数码评测</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 h-32 focus:outline-none focus:border-blue-500"
            placeholder="描述一下这个话题是关于什么的..."
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700">
          创建话题
        </button>
      </form>
    </div>
  );
}