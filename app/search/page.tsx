// app/search/page.tsx (Reddit 风格高级搜索版)
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { ApiPost, ApiTopic, ApiUser } from '@/types'; // 确保 ApiUser 已定义
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import TopicJoinButton from '@/components/TopicJoinButton';
import FollowButton from '@/components/FollowButton'; // 复用关注按钮
import { useAuth } from '@/context/AuthContext';
import { highlightText } from '@/utils/highlight'; // 导入高亮工具

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // URL 参数
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'posts'; // 默认显示帖子 'posts' | 'communities' | 'people'
  const sort = searchParams.get('sort') || 'relevance'; // 'relevance' | 'hot' | 'comments' | 'new'
  const time = searchParams.get('time') || 'all'; // 'all' | 'today' | 'week'

  const { accessToken } = useAuth();

  // 数据状态
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]); // (需在 types 里确认 ApiUser 包含 followers_count 等)
  const [loading, setLoading] = useState(false);

  // 辅助：更新 URL 参数
  const updateParam = (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (!query) return;
    
    const fetchData = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const headers: any = {};
      if (accessToken) headers['Authorization'] = `JWT ${accessToken}`;

      try {
        if (type === 'posts') {
            // 构建帖子查询参数
            let ordering = ''; 
            if (sort === 'hot') ordering = '-score';
            else if (sort === 'comments') ordering = '-comments_count';
            else if (sort === 'new') ordering = '-created_at';
            // relevance 暂时用默认 (后端可能未实现复杂相关性，暂用默认排序)

            const res = await axios.get(
                `${apiUrl}/api/v1/posts/?search=${query}&ordering=${ordering}&time_range=${time}`, 
                { headers }
            );
            setPosts(res.data);
        } 
        else if (type === 'communities') {
            // 话题搜索: 按热度(heat_score)或相关性排序
            const res = await axios.get(
                `${apiUrl}/api/v1/topics/?search=${query}&ordering=-heat_score`, 
                { headers }
            );
            setTopics(res.data.results || res.data);
        }
        else if (type === 'people') {
            // 用户搜索: 按粉丝数排序
            const res = await axios.get(
                `${apiUrl}/api/v1/profiles/?search=${query}&ordering=-followers_count`, 
                { headers }
            );
            setUsers(res.data.results || res.data);
        }
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, type, sort, time, accessToken]);

  // --- UI 组件 ---

  // 1. 分类 Tabs (Posts, Communities, People)
  const TabBtn = ({ id, label }: { id: string, label: string }) => (
      <button
        onClick={() => updateParam('type', id)}
        className={`px-4 py-2 font-medium text-sm rounded-full transition-colors ${
            type === id 
            ? 'bg-gray-200 text-black' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        {label}
      </button>
  );

  // 2. 筛选工具栏 (仅在 Posts 模式下显示)
  const FilterBar = () => {
      if (type !== 'posts') return null;
      return (
          <div className="flex gap-2 mb-4">
              <select 
                value={sort} 
                onChange={(e) => updateParam('sort', e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full bg-white hover:bg-gray-50 focus:outline-none"
              >
                  <option value="relevance">Relevance (相关度)</option>
                  <option value="hot">Hot (热度)</option>
                  <option value="comments">Comment Count (评论数)</option>
                  <option value="new">New (最新)</option>
              </select>

              <select 
                value={time} 
                onChange={(e) => updateParam('time', e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full bg-white hover:bg-gray-50 focus:outline-none"
              >
                  <option value="all">All Time (全部时间)</option>
                  <option value="week">Past Week (本周)</option>
                  <option value="today">Today (今天)</option>
              </select>
          </div>
      );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4">
        搜索结果: "{query}"
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2 overflow-x-auto">
          <TabBtn id="posts" label="帖子 (Posts)" />
          <TabBtn id="communities" label="社区 (Communities)" />
          <TabBtn id="people" label="用户 (People)" />
      </div>

      {/* Filters */}
      <FilterBar />

      {/* Content Area */}
      {loading ? (
          <div className="py-20 text-center text-gray-500">搜索中...</div>
      ) : (
          <div>
              {/* --- 帖子列表 --- */}
              {type === 'posts' && (
                  <div className="flex flex-col space-y-4">
                      {posts.length === 0 && <div className="text-gray-500">没有找到相关帖子。</div>}
                      {posts.map(post => (
                          // 这里我们要稍微魔改一下 PostCard 里的 Title，支持高亮
                          // 但 PostCard 封装太深，简单起见，我们暂时渲染标准 PostCard
                          // 如果要高亮标题，最好给 PostCard 传一个 highlightText prop
                          // 这里我们先直接用标准组件
                          <div key={post.id} className="relative">
                              <PostCard post={post} />
                              {/* 一个覆盖层演示高亮 (仅作演示，实际最好改 PostCard) */}
                              {/* 更好的做法是修改 PostCard 接受一个 highlightKeyword 属性 */}
                          </div>
                      ))}
                  </div>
              )}

              {/* --- 社区列表 --- */}
              {type === 'communities' && (
                  <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100">
                      {topics.length === 0 && <div className="p-4 text-gray-500">没有找到相关社区。</div>}
                      {topics.map(topic => (
                          <div key={topic.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                              <div className="flex items-center gap-4 overflow-hidden">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0 overflow-hidden">
                                      {topic.icon ? <img src={topic.icon} className="w-full h-full object-cover"/> : "t/"}
                                  </div>
                                  <div>
                                      <Link href={`/topics/${topic.slug}`} className="font-bold text-gray-900 hover:underline block">
                                          t/{highlightText(topic.name, query)}
                                      </Link>
                                      <p className="text-xs text-gray-500">
                                          {topic.subscribers_count} 成员 • {topic.description?.slice(0, 50)}...
                                      </p>
                                  </div>
                              </div>
                              <TopicJoinButton slug={topic.slug} initialIsJoined={topic.is_subscribed} />
                          </div>
                      ))}
                  </div>
              )}

              {/* --- 用户列表 --- */}
              {type === 'people' && (
                  <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100">
                      {users.length === 0 && <div className="p-4 text-gray-500">没有找到相关用户。</div>}
                      {users.map(u => (
                          <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                      {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover"/> : 
                                      <div className="w-full h-full flex items-center justify-center">{u.username[0].toUpperCase()}</div>}
                                  </div>
                                  <div>
                                      <Link href={`/users/${u.username}`} className="font-bold text-gray-900 hover:underline block">
                                          u/{highlightText(u.username, query)}
                                      </Link>
                                      <p className="text-xs text-gray-500">
                                          {(u as any).followers_count || 0} 粉丝 {/* 确保类型中有定义 */}
                                      </p>
                                  </div>
                              </div>
                              {/* 如果不是自己，显示关注按钮 */}
                              <FollowButton 
                                username={u.username} 
                                initialIsFollowed={(u as any).is_followed} // 类型断言，或者去更新 ApiUser 类型
                              />
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">加载搜索...</div>}>
      <SearchContent />
    </Suspense>
  );
}