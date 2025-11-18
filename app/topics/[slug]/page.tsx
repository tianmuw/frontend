// app/topics/[slug]/page.tsx

import { ApiPost, ApiTopic } from "@/types"; // 导入我们的类型
import Link from 'next/link'; // 用于导航
import VoteButtons from '@/components/VoteButtons';
import SortTabs from '@/components/SortTabs';

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
        <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            {/* 1. 话题的"横幅"信息 */}
            <header style={{ background: '#f0f0f0', padding: '2rem', marginBottom: '2rem', borderRadius: '8px' }}>
                <h1 style={{ margin: 0 }}>话题: {topic.name}</h1>
                <p style={{ fontSize: '1.1rem', color: '#333' }}>{topic.description}</p>
                <p>Slug: {topic.slug}</p>
            </header>

            {/* 2. 话题下的帖子列表 */}
            <h2>{topic.name} 话题下的帖子</h2>
            <SortTabs />
            {posts.length === 0 ? (
                <p>这个话题下还没有帖子。快去<Link href="/create-post">发布一个</Link>！</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {posts.map((post) => (
                        // (我们复用首页的帖子卡片样式)
                        <div
                            key={post.id}
                            style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', }}
                        >
                            {/* (!!!) 新增：投票组件 (!!!) */}
                            <VoteButtons
                                postId={post.id}
                                initialScore={post.score}
                                initialUserVote={post.user_vote}
                            />

                            <div style={{ flex: 1 }}>
                                <Link
                                    href={`/posts/${post.id}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <h2 style={{ margin: 0 }}>{post.title}</h2>
                                </Link>
                                <p style={{ fontSize: '0.9rem', color: '#555' }}>
                                    发布者: <strong>{post.author.username}</strong>
                                    {/* 我们不再需要显示话题，因为我们已经在话题页里了 */}
                                </p>
                                <p>{post.content}</p>

                                <div style={{ background: '#f9f9f9', padding: '1rem', marginTop: '1rem' }}>
                                    <strong>关联商品:</strong>
                                    <p>
                                        {post.product.scrape_status === 'SUCCESS'
                                            ? post.product.product_title
                                            : `[${post.product.scrape_status}] - ${post.product.original_url}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}