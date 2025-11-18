// app/posts/[id]/page.tsx

import { ApiPost } from "@/types";
import Link from 'next/link';
import { use } from 'react'; // 导入 use 钩子
import VoteButtons from "@/components/VoteButtons"; // 导入投票组件
import CommentSection from '@/components/CommentSection';

// (新) 定义这个页面的 props 类型
interface PostPageProps {
  params: {
    id: string; // URL 里的 ID 总是字符串
  };
}

/**
 * 数据抓取函数: 获取 *单个* 帖子的详细信息
 */
async function getPostDetails(id: string): Promise<ApiPost | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    // (!!!) 我们调用的是详情页 API (!!!)
    const res = await fetch(`${apiUrl}/api/v1/posts/${id}/`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch post details", error);
    return null;
  }
}

/**
 * 这是我们的“帖子详情”页面组件
 */
export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  // 使用 React.use() 来解开 Promise
  const post = await getPostDetails(id);

  // 如果帖子不存在
  if (!post) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>帖子未找到</h1>
        <p>无法找到 ID 为 "{id}" 的帖子。</p>
        <Link href="/">返回广场</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>

      {/* 1. 帖子内容 */}
      <article style={{ display: 'flex', gap: '1rem' }}>
        {/* 投票按钮 */}
        <VoteButtons 
          postId={post.id}
          initialScore={post.score}
          initialUserVote={post.user_vote}
        />

        {/* 帖子详情 */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.9rem', color: '#555' }}>
            发布于 
            <Link 
              href={`/topics/${post.topic.slug}`} 
              style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}
            >
              {post.topic.name}
            </Link> 
            由 <strong>{post.author.username}</strong>
          </p>

          <h1 style={{ marginTop: 0 }}>{post.title}</h1>

          {/* (新) 显示完整的帖子内容 */}
          <p style={{ fontSize: '1.1rem' }}>{post.content}</p>

          {/* (新) 显示完整的商品卡片 */}
          <div style={{ background: '#f9f9f9', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
            <strong>关联商品:</strong>
            <p>
              <a href={post.product.original_url} target="_blank" rel="noopener noreferrer">
                {post.product.product_title || '查看商品'}
              </a>
            </p>
            {post.product.product_image_url && (
              <img 
                src={post.product.product_image_url} 
                alt={post.product.product_title || '商品图片'} 
                style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} 
              />
            )}
            <p>价格: {post.product.product_price}</p>
          </div>
        </div>
      </article>

      <hr style={{ margin: '2rem 0' }} />

      {/* 2. 评论区 (!!! 下一步实现 !!!) */}
      <section>
        <h2>评论区</h2>
        <CommentSection postId={id} />
      </section>

    </main>
  );
}