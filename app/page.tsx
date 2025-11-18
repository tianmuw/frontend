// app/page.tsx

import { ApiPost } from "@/types"; // 导入我们刚定义的类型
import SortTabs from '@/components/SortTabs';
import PostCard from '@/components/PostCard';

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
  const resolvedSearchParams = (await searchParams) || {};
  const sort = resolvedSearchParams.sort;
  const posts = await getPosts(sort);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 px-2">社交购物广场</h1>
      
      <SortTabs />

      {posts.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
          没有帖子。快去发布一个吧！
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {posts.map((post) => (
            // (!!) 直接渲染 Client Component, 解决 onClick 问题 (!!)
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}