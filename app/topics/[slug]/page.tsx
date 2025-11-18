// app/topics/[slug]/page.tsx

import { ApiPost, ApiTopic } from "@/types"; // 导入我们的类型
import Link from 'next/link'; // 用于导航
import VoteButtons from '@/components/VoteButtons';
import SortTabs from '@/components/SortTabs';
import PostCard from '@/components/PostCard';

// (新) 定义这个页面的 props 类型
// Next.js 会自动把 URL 中的 {slug} 作为 'params' 传进来
interface TopicPageProps {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined }; // <-- 添加
}

/**
 * 数据抓取函数 1: 获取话题本身的详细信息
 */
async function getTopicDetails(slug: string): Promise<ApiTopic | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
        const res = await fetch(`${apiUrl}/api/v1/topics/${slug}/`, {
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch topic details", error);
        return null;
    }
}

/**
 * 数据抓取函数 2: 获取这个话题下的所有帖子
 */
async function getPostsForTopic(slug: string, sort: string | string[] | undefined): Promise<ApiPost[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    let orderingParam = '-created_at'; // 默认
    if (sort === 'hot') {
        orderingParam = '-score';
    }
    try {
        // (!!!) 使用我们刚在后端启用的筛选功能 (!!!)
        const res = await fetch(`${apiUrl}/api/v1/posts/?topic__slug=${slug}&ordering=${orderingParam}`, {
            cache: 'no-store',
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch posts for topic", error);
        return [];
    }
}

/**
 * 这是我们的“话题详情”页面组件
 */
export default async function TopicPage({ params, searchParams }: TopicPageProps) {
    const { slug } = await params; // 从 props 中解构出 slug

    const resolvedSearchParams = (await searchParams) || {};
    const sort = resolvedSearchParams.sort;

    // 我们不再使用 Promise.all，而是按顺序 await
    // 这避免了 Next.js 中 async/await 和 params 的冲突
    const topic = await getTopicDetails(slug);
    const posts = await getPostsForTopic(slug, sort);

    // 如果话题不存在 (例如输错了 URL)
    if (!topic) {
        return (
            <main style={{ padding: '2rem' }}>
                <h1>话题未找到</h1>
                <p>无法找到 slug 为 "{slug}" 的话题。</p>
                <Link href="/">返回广场</Link>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* 1. 顶部 Banner 区域 (模仿 Reddit 头部) */}
            <div className="bg-white border-b border-gray-200 mb-6">
                {/* 彩色背景条 (可以是图片) */}
                <div className="h-24 bg-blue-500 w-full"></div>
                
                {/* 话题信息栏 */}
                <div className="max-w-5xl mx-auto px-4 pb-4 relative">
                    <div className="flex items-end -mt-6 mb-2">
                         {/* 大头像 */}
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
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">
                                加入
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 主内容区域：双栏布局 */}
            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 左侧：帖子列表 (占 2/3) */}
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

                {/* 右侧：侧边栏 (占 1/3) - 模仿 Reddit Sidebar */}
                <div className="hidden md:block">
                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm sticky top-4">
                        <div className="bg-blue-50 text-gray-600 font-bold text-sm p-2 rounded mb-2 uppercase tracking-wider">
                            关于社区
                        </div>
                        <div className="mb-4 text-gray-700 text-sm leading-relaxed">
                            {topic.description || "这个话题还没有简介。"}
                        </div>
                        
                        <div className="border-t border-gray-100 pt-4 mt-4 text-sm text-gray-500">
                            <div className="flex items-center mb-2">
                                <span className="mr-2">📅</span> 创建于 {new Date(topic.created_at || Date.now()).toLocaleDateString()}
                            </div>
                        </div>

                        <Link 
                            href="/create-post" 
                            className="mt-4 block w-full text-center bg-blue-600 text-white py-2 rounded-full font-bold hover:bg-blue-700"
                        >
                            发布帖子
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}