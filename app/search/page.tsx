// app/search/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { ApiPost, ApiTopic } from '@/types';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import TopicJoinButton from '@/components/TopicJoinButton'; // 复用加入按钮
import { useAuth } from '@/context/AuthContext'; // 为了获取 Token (判断是否加入)

// 为了使用 useSearchParams，我们需要把主要逻辑包在一个组件里
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || ''; // 获取 ?q=... 参数
  const { accessToken } = useAuth();

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // 准备 Headers (为了获取 is_subscribed 状态)
      const headers: any = {};
      if (accessToken) {
        headers['Authorization'] = `JWT ${accessToken}`;
      }

      try {
        // (!!!) 并行发起两个搜索请求 (!!!)
        const [postsRes, topicsRes] = await Promise.all([
          // 搜帖子
          axios.get(`${apiUrl}/api/v1/posts/?search=${encodeURIComponent(query)}`, { headers }),
          // 搜话题
          axios.get(`${apiUrl}/api/v1/topics/?search=${encodeURIComponent(query)}`, { headers })
        ]);

        setPosts(postsRes.data);
        setTopics(topicsRes.data);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, accessToken]);

  if (!query) {
    return <div className="p-10 text-center text-gray-500">请输入关键词进行搜索</div>;
  }

  if (loading) {
    return <div className="p-10 text-center text-gray-500">正在搜索 "{query}"...</div>;
  }

  const hasResults = posts.length > 0 || topics.length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 px-2">
        "{query}" 的搜索结果
      </h1>

      {!hasResults && (
        <div className="p-10 text-center bg-white rounded border border-gray-200">
            <p className="text-gray-500">没有找到相关内容。</p>
        </div>
      )}

      {/* 1. 话题结果 (如果有) */}
      {topics.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3 px-2 flex items-center gap-2">
            <span>🌐</span> 社区 (Topics)
          </h2>
          <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100">
            {topics.map(topic => (
              <div key={topic.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                        t/
                    </div>
                    <div className="min-w-0">
                        <Link href={`/topics/${topic.slug}`} className="font-bold text-gray-900 hover:underline block truncate">
                            t/{topic.name}
                        </Link>
                        <p className="text-sm text-gray-500 truncate max-w-md">
                            {topic.description || "暂无简介"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {topic.subscribers_count} 成员
                        </p>
                    </div>
                </div>
                {/* 复用我们的加入按钮 */}
                <TopicJoinButton 
                    slug={topic.slug} 
                    initialIsJoined={topic.is_subscribed} 
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. 帖子结果 (如果有) */}
      {posts.length > 0 && (
        <div>
           <h2 className="text-lg font-bold text-gray-700 mb-3 px-2 flex items-center gap-2">
            <span>mb</span> 帖子 (Posts)
          </h2>
          <div className="flex flex-col space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 必须用 Suspense 包裹使用 useSearchParams 的组件
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">加载搜索组件...</div>}>
      <SearchContent />
    </Suspense>
  );
}