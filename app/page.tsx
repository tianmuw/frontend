// app/page.tsx (客户端渲染版 - 支持黑名单过滤)
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ApiPost } from "@/types";
import Link from 'next/link';
import VoteButtons from '@/components/VoteButtons';
import SortTabs from '@/components/SortTabs';
import PostCard from '@/components/PostCard';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // (!!) 导入 AuthContext

// 包装组件以使用 useSearchParams
function HomeContent() {
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort') || 'new';
  
  const { accessToken } = useAuth(); // (!!) 获取 Token
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      let orderingParam = '-created_at';
      if (sort === 'hot') {
        orderingParam = '-score';
      }

      // (!!) 关键：准备 Headers (如果有 Token 就带上) (!!)
      const headers: any = {};
      if (accessToken) {
        headers['Authorization'] = `JWT ${accessToken}`;
      }

      try {
        // 发送带 Token 的请求
        const res = await axios.get(`${apiUrl}/api/v1/posts/?ordering=${orderingParam}`, {
            headers: headers
        });
        setPosts(res.data);
      } catch (error) {
        console.error('Failed to fetch posts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sort, accessToken]); // 当排序或 Token 变化时重新获取

  if (loading) {
      return <div className="p-10 text-center text-gray-500">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 px-2">社交购物广场</h1>
      
      <SortTabs />

      {posts.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow border border-gray-200">
          没有帖子。快去发布一个吧！
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

// 必须使用 Suspense 包裹客户端组件中的 useSearchParams
import { Suspense } from 'react';

export default function HomePage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">加载页面...</div>}>
            <HomeContent />
        </Suspense>
    );
}