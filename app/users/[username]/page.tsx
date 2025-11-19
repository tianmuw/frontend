// app/users/[username]/page.tsx
import { ApiPost, ApiUser } from "@/types";
import PostCard from "@/components/PostCard";

interface UserPageProps {
  params: { username: string };
}

async function getUserPosts(username: string): Promise<ApiPost[]> {
  // 注意：我们需要在后端实现一个按作者筛选的接口
  // 目前我们先用 ?search=username 或者在前端过滤（临时方案）
  // 为了演示，我们暂时获取所有帖子 (实际开发需要后端支持 /api/v1/posts/?author__username=...)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
     // 假设后端支持搜索作者 (我们之后会去后端加这个 filter)
     // 现在先获取最新的
     const res = await fetch(`${apiUrl}/api/v1/posts/`, { cache: 'no-store' });
     if (!res.ok) return [];
     const allPosts: ApiPost[] = await res.json();
     // (临时前端过滤)
     return allPosts.filter(p => p.author.username === username);
  } catch (e) { return []; }
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  const posts = await getUserPosts(username);

  return (
    <div>
       <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4 flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {username.slice(0, 1).toUpperCase()}
          </div>
          <div>
              <h1 className="text-2xl font-bold text-gray-900">u/{username}</h1>
              <p className="text-gray-500">社区成员</p>
              <div className="mt-2 flex gap-2">
                  <button className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold hover:bg-blue-700">关注</button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-200">私信</button>
              </div>
          </div>
       </div>

       <h2 className="font-bold text-gray-700 mb-4 text-lg">发布的帖子</h2>

       {posts.length === 0 ? (
         <div className="text-center py-10 text-gray-500 bg-white rounded border border-gray-200">该用户还没发过帖。</div>
       ) : (
         <div className="flex flex-col space-y-4">
           {posts.map(post => <PostCard key={post.id} post={post} />)}
         </div>
       )}
    </div>
  );
}