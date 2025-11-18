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
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">社交购物广场</h1>

      <SortTabs />

      {/* (!!!) 帖子列表容器 (!!!) */}
      {posts.length === 0 ? (
        <p className="text-gray-600">没有帖子。快去发布一个吧！</p>
      ) : (
        // (!!) flex-col 和 space-y-4 会给卡片之间添加 1rem 的间距
        <div className="flex flex-col space-y-4">
          {posts.map((post) => (

            // (!!!) 帖子卡片 (!!!)
            // 这就是我们的新卡片样式：白色背景、圆角、阴影、flex 布局
            <div
              key={post.id}
              className="bg-white shadow-md rounded-lg p-4 flex space-x-4"
            >
              {/* 投票组件 (我们稍后也会改造它) */}
              <VoteButtons 
                postId={post.id}
                initialScore={post.score}
                initialUserVote={post.user_vote}
              />

              {/* (!!) 帖子主内容 (!!!) */}
              <div className="flex-1"> 
                {/* 帖子标题 */}
                <Link 
                  href={`/posts/${post.id}`} 
                  className="text-xl font-bold text-gray-900 hover:text-blue-600 no-underline"
                >
                  {post.title}
                </Link>

                {/* 元信息 (作者, 话题) */}
                <p className="text-sm text-gray-500 mt-1">
                  发布者: 
                  <strong className="font-medium text-gray-900"> {post.author.username}</strong> | 
                  话题: 
                  <Link 
                    href={`/topics/${post.topic.slug}`} 
                    className="font-medium text-blue-600 hover:underline ml-1"
                  >
                    {post.topic.name}
                  </Link>
                </p>

                {/* 帖子内容 (我们只显示摘要) */}
                <p className="text-gray-700 mt-2">
                  {post.content.length > 200 
                    ? `${post.content.substring(0, 200)}...` 
                    : post.content}
                </p>

                {/* (!!) 关联商品卡片 (!!!) */}
                <div className="bg-gray-50 p-3 mt-3 rounded-md border border-gray-200">
                  <strong className="text-gray-800">关联商品:</strong>
                  <p className="text-sm text-gray-700 truncate">
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
    </div>
  );
}