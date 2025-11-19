// components/RightSidebar.tsx
'use client'; // 这里我们暂时用 Client Component，方便快速展示，理想情况是 Server Component

import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ApiTopic } from '@/types';
import TopicJoinButton from './TopicJoinButton';

export default function RightSidebar() {
    const [topics, setTopics] = useState<ApiTopic[]>([]);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                // 这里未来可以改为 /api/v1/topics/?ordering=-subscribers_count
                const res = await axios.get(`${apiUrl}/api/v1/topics/`);
                setTopics(res.data.slice(0, 5)); // 只显示前5个
            } catch (e) { console.error(e); }
        };
        fetchTopics();
    }, []);

    return (
        <aside className="w-80 fixed top-16 right-0 bottom-0 overflow-y-auto hidden xl:block py-6 px-4 z-40">
            {/* 热门社区卡片 */}
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
                                    <span className="text-xs text-gray-500">0 成员</span>
                                </div>
                            </div>
                            <TopicJoinButton
                                slug={topic.slug}
                                initialIsJoined={topic.is_subscribed}
                                className="px-3 py-1 text-xs" // 小一点的样式
                            />
                        </div>
                    ))}
                </div>

                <div className="p-3 text-center">
                    <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">查看更多</Link>
                </div>
            </div>

            {/* 底部版权信息 */}
            <div className="mt-6 text-xs text-gray-500 px-2 space-y-2">
                <p>关于 • 帮助 • 博客 • 招聘</p>
                <p>隐私政策 • 用户协议</p>
                <p>© 2025 SocialShop, Inc.</p>
            </div>
        </aside>
    );
}