// app/page.tsx

import { ApiPost } from "@/types"; // 导入我们刚定义的类型
import VoteButtons from '@/components/VoteButtons';
import Link from 'next/link';
import SortTabs from '@/components/SortTabs';

//1. 定义 props 类型
interface HomePageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

/**
 * 这是一个数据抓取函数。
 * Next.js 会在服务器端运行它，去抓取我们的 Django API。
 * 'no-store' 告诉 Next.js 这是一个动态数据，不要缓存它。
 */
async function getPosts(sort: string | string[] | undefined): Promise<ApiPost[]> {
  // 1. 从我们的 .env.local 文件中获取 API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  let orderingParam = '-created_at'; // 默认是 "最新"
  if (sort === 'hot') {
    orderingParam = '-score'; // 如果是 "热门"
  }

  // 2. 抓取我们的 /posts/ 接口
  const res = await fetch(`${apiUrl}/api/v1/posts/?ordering=${orderingParam}`, {
    cache: 'no-store', // 确保我们总是拿到最新数据
  });

  // 3. 如果抓取失败，抛出错误
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }

  // 4. 把 JSON 数据返回
  return res.json();
}

/**
 * 这是我们的"广场"主页组件
 * 它现在是一个"异步" (async) 组件
 */
export default async function HomePage({ searchParams }: HomePageProps) {

  // 从 props 中获取 sort 参数
  const resolvedSearchParams = (await searchParams) || {};
  const sort = resolvedSearchParams.sort;

  // 1. 在页面加载时，"等待" getPosts() 函数完成
  const posts = await getPosts(sort);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>社交购物广场</h1>
      <SortTabs />
      <p>从我们的 Django API 加载的实时数据：</p>

      <hr style={{ margin: '1rem 0' }} />

      {/* 2. 检查是否有帖子 */}
      {posts.length === 0 ? (
        <p>没有帖子。请去 Django admin 后台创建一些。</p>
      ) : (
        // 3. 遍历 (map) 帖子数组，为每个帖子显示一个卡片
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', }}
            >
              {/* (!!!) 新增：投票组件放在左侧 (!!!) */}
              <VoteButtons
                postId={post.id}
                initialScore={post.score}
                initialUserVote={post.user_vote}
              />

              <div style={{ flex: 1 }}>
                {/* 帖子标题 */}
                <Link
                  href={`/posts/${post.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h2 style={{ margin: 0 }}>{post.title}</h2>
                </Link>

                {/* 作者和话题信息 */}
                <p style={{ fontSize: '0.9rem', color: '#555' }}>
                  发布者: <strong>{post.author.username}</strong> |
                  话题:
                  {/* 我们把话题名称变成了"可点击"的链接 */}
                  <Link
                    href={`/topics/${post.topic.slug}`}
                    style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}
                  >
                    {post.topic.name}
                  </Link>
                </p>

                {/* 帖子内容 */}
                <p>{post.content}</p>

                {/* 关联的商品信息 */}
                <div style={{ background: '#f9f9f9', padding: '1rem', marginTop: '1rem' }}>
                  <strong>关联商品:</strong>
                  <p>
                    {post.product.scrape_status === 'SUCCESS'
                      ? post.product.product_title // 显示抓取到的标题
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