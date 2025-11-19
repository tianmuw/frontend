// components/RightSidebar.tsx (完整替换或修改 fetchTopics 部分)
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ApiTopic } from '@/types';
import TopicJoinButton from './TopicJoinButton';
import { useAuth } from '@/context/AuthContext'; // 1. 导入 Auth

export default function RightSidebar() {
  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const { accessToken } = useAuth(); // 2. 获取 Token
  
  useEffect(() => {
    const fetchTopics = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            
            // 3. 准备 Headers
            const headers: any = {};
            if (accessToken) {
                headers['Authorization'] = `JWT ${accessToken}`;
            }

            // 4. 带 Headers 请求
            const res = await axios.get(`${apiUrl}/api/v1/topics/`, { headers });
            
            // 简单排序：按 subscribers_count 倒序
            const sorted = res.data.sort((a: any, b: any) => (b.subscribers_count || 0) - (a.subscribers_count || 0));
            setTopics(sorted.slice(0, 5)); 
        } catch(e) { console.error(e); }
    };
    // 5. 添加 accessToken 到依赖，这样登录/注销时榜单会自动刷新状态
    fetchTopics();
  }, [accessToken]); 

  return (
    <aside className="w-80 fixed top-16 right-0 bottom-0 overflow-y-auto hidden xl:block py-6 px-4 z-40">
       <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
             <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">热门社区</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
             {topics.map((topic, index) => (
                <div key={topic.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <span className="font-medium text-gray-500 w-4 text-center">{index + 1}</span>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                            t/
                        </div>
                        <div className="flex flex-col min-w-0">
                            <Link href={`/topics/${topic.slug}`} className="font-bold text-sm text-gray-900 hover:underline truncate">
                                t/{topic.name}
                            </Link>
                            <span className="text-xs text-gray-500">{topic.subscribers_count} 成员</span>
                        </div>
                    </div>
                    {/* 按钮组件 */}
                    <TopicJoinButton 
                        slug={topic.slug} 
                        initialIsJoined={topic.is_subscribed} 
                        className="px-3 py-1 text-xs min-w-[60px]" 
                    />
                </div>
             ))}
          </div>
          
          <div className="p-3 text-center">
             <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">查看更多</Link>
          </div>
       </div>

       <div className="mt-6 text-xs text-gray-500 px-2 space-y-2">
          <p>© 2025 SocialShop, Inc.</p>
       </div>
    </aside>
  );
}