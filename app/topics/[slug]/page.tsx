// app/topics/[slug]/page.tsx (客户端渲染版 - 解决 Auth 问题)
'use client';

import { useState, useEffect, use } from 'react'; 
import { ApiPost, ApiTopic } from "@/types";
import Link from 'next/link';
import SortTabs from '@/components/SortTabs';
import PostCard from '@/components/PostCard';
import TopicJoinButton from '@/components/TopicJoinButton';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface TopicPageProps {
  params: Promise<{ slug: string }>; 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>; 
}

export default function TopicPage({ params, searchParams }: TopicPageProps) {
  // 1. 解包 Promise 参数
  const { slug } = use(params);
  const resolvedSearchParams = use(searchParams);
  const sort = resolvedSearchParams?.sort;

  // 2. 获取 Token (这是解决问题的关键！)
  const { accessToken } = useAuth(); 
  
  const [topic, setTopic] = useState<ApiTopic | null>(null);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // (!!!) 关键：如果用户已登录，把 Token 放入请求头 (!!!)
      const headers: any = {};
      if (accessToken) {
        headers['Authorization'] = `JWT ${accessToken}`;
      }

      try {
        // 并行请求: 话题详情 + 帖子列表
        const [topicRes, postsRes] = await Promise.all([
          // 请求 1: 带 Token 获取话题详情 (这样 Django 才知道 is_subscribed)
          axios.get(`${apiUrl}/api/v1/topics/${slug}/`, { headers }),
          
          // 请求 2: 带 Token 获取帖子 (排序)
          axios.get(`${apiUrl}/api/v1/posts/?topic__slug=${slug}&ordering=${sort === 'hot' ? '-score' : '-created_at'}`, { headers })
        ]);

        setTopic(topicRes.data);
        setPosts(postsRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    // 当 slug, sort 或 accessToken 变化时 (例如刚登录成功)，重新请求
    fetchData();

  }, [slug, sort, accessToken]); 


  if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>;
  if (!topic) return <div className="p-10 text-center">话题未找到</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 1. 顶部 Banner */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="h-24 bg-blue-500 w-full"></div>
        <div className="max-w-5xl mx-auto px-4 pb-4 relative">
          <div className="flex items-end -mt-6 mb-2">
            <div className="w-20 h-20 bg-white rounded-full border-4 border-white flex items-center justify-center shadow-sm overflow-hidden mr-4">
              <span className="text-4xl font-bold text-gray-800">t/</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {topic.name}
              </h1>
              <p className="text-gray-500 text-sm font-medium">t/{topic.slug}</p>
            </div>

            <div className="ml-auto mb-2 flex gap-2">
              {/* 这里的 initialIsJoined 会从后端获取到正确的 true/false */}
              <TopicJoinButton
                slug={topic.slug}
                initialIsJoined={topic.is_subscribed}
                className="px-6 py-2 text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. 主内容区域 */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 左侧帖子 */}
        <div className="md:col-span-2">
          <div className="mb-4">
            <SortTabs />
          </div>

          {posts.length === 0 ? (
            <div className="bg-white p-10 text-center rounded border border-gray-200">
              还没有帖子。
              <Link href="/create-post" className="text-blue-600 underline ml-1">去发第一帖</Link>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* 右侧侧边栏 */}
        <div className="hidden md:block">
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm sticky top-20">
            <div className="bg-blue-50 text-gray-600 font-bold text-sm p-2 rounded mb-2 uppercase tracking-wider">
              关于社区
            </div>
            <div className="mb-4 text-gray-700 text-sm leading-relaxed">
              {topic.description || "这个话题还没有简介。"}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center mb-2">
                  {/* 显示成员数 */}
                  <span className="font-bold text-black mr-1">{topic.subscribers_count}</span> 成员
              </div>
              <div className="flex items-center mb-2">
                <span className="mr-2">📅</span> 创建于 {new Date(topic.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>

            <Link
              href="/create-post"
              className="mt-4 block w-full text-center bg-blue-600 text-white py-2 rounded-full font-bold hover:bg-blue-700 transition-colors"
            >
              发布帖子
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}