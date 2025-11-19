// app/create-post/page.tsx (Tailwind 美化版)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ApiTopic } from '@/types';

export default function CreatePostPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/api/v1/topics/`);
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopic(data[0].slug);
        }
      } catch (err) {
        console.error('无法加载话题', err);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(
        `${apiUrl}/api/v1/posts/`,
        {
            title,
            content,
            product_url: productUrl,
            topic: selectedTopic,
        },
        { headers: { Authorization: `JWT ${accessToken}` } }
      );
      router.push('/');
    } catch (err) {
      console.error('发布失败', err);
      setError('发布失败，请检查所有字段并重试。');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return <div className="p-10 text-center text-gray-500">请先登录...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 mt-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
        发布新帖子
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 话题选择 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">选择话题 (Community)</label>
          <div className="relative">
             <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                required
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
            >
                {topics.length === 0 ? (
                <option disabled>加载中...</option>
                ) : (
                topics.map((topic) => (
                    <option key={topic.slug} value={topic.slug}>
                    t/{topic.name}
                    </option>
                ))
                )}
            </select>
          </div>
        </div>

        {/* 标题 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="起一个有趣的标题..."
          />
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y placeholder-gray-400"
            placeholder="分享你的心得、评测或故事..."
          />
        </div>

        {/* 商品链接 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">关联商品链接 (URL)</label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              🔗
            </span>
            <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                required
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="例如: https://item.jd.com/..."
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">我们会自动抓取商品信息。</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">{error}</div>}

        <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '发布中...' : '发布'}
            </button>
        </div>
      </form>
    </div>
  );
}