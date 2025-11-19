// app/feed/following/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ApiPost } from "@/types";
import { useAuth } from '@/context/AuthContext';
import PostCard from "@/components/PostCard";
import Link from 'next/link';

export default function FollowingFeedPage() {
  const { accessToken, isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 路由保护：如果未登录，重定向到登录页
    // (加一个短暂延迟或状态判断，防止刷新时瞬间跳转)
    const timer = setTimeout(() => {
        if (!isAuthenticated && !accessToken) { // 简单判断
            // 实际项目中通常由 AuthContext 提供一个 isLoadingAuth 状态来更精准判断
             router.push('/login');
        }
    }, 500);

    if (!accessToken) return () => clearTimeout(timer);

    // 2. 获取数据
    const fetchFollowingFeed = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const res = await axios.get(`${apiUrl}/api/v1/posts/following/`, {
            headers: { Authorization: `JWT ${accessToken}` }
        });
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch following feed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingFeed();
    return () => clearTimeout(timer);

  }, [accessToken, isAuthenticated, router]);

  // 加载状态
  if (loading) {
      return <div className="p-10 text-center text-gray-500">加载关注流...</div>;
  }

  // 未登录状态 (虽然会跳转，但在跳转前可能会短暂显示)
  if (!isAuthenticated) {
      return <div className="p-10 text-center text-gray-500">请先登录查看关注流。</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 px-2 flex items-center gap-2">
         <span className="text-2xl">📡</span> 我的关注流
      </h1>
      
      {/* 提示信息 */}
      <div className="mb-6 bg-blue-50 text-blue-800 px-4 py-3 rounded-md text-sm border border-blue-100">
        这里显示你关注的用户 (<strong>u/{user?.username}</strong> 关注的人) 和你加入的话题的最新动态。
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">你的关注流是空的</h3>
          <p className="text-gray-500 mb-6">去发现一些有趣的人或话题吧！</p>
          <div className="flex justify-center gap-4">
             <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-700">
                去广场逛逛
             </Link>
             <Link href="/create-topic" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-bold hover:bg-gray-200">
                创建新话题
             </Link>
          </div>
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