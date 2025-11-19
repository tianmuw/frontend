// app/users/[username]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { ApiPost, ApiProfile } from "@/types";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default function UserPage({ params }: UserPageProps) {
  const { username } = use(params);
  const { accessToken } = useAuth();
  
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const headers: any = {};
      if (accessToken) {
        headers['Authorization'] = `JWT ${accessToken}`;
      }

      try {
        const profileRes = await axios.get(`${apiUrl}/api/v1/profiles/${username}/`, { headers });
        setProfile(profileRes.data);

        const postsRes = await axios.get(`${apiUrl}/api/v1/posts/`, { headers });
        const userPosts = postsRes.data.filter((p: ApiPost) => p.author.username === username);
        setPosts(userPosts);

      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, accessToken]);

  // (!!!) 关键：处理关注状态变化 (!!!)
  const handleFollowChange = (newIsFollowed: boolean) => {
    if (!profile) return;

    // 乐观更新：直接在前端修改数字，不需要重新请求后端
    setProfile({
        ...profile,
        is_followed: newIsFollowed,
        followers_count: newIsFollowed 
            ? profile.followers_count + 1 // 关注：+1
            : profile.followers_count - 1 // 取消：-1
    });
  };

  if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>;
  if (!profile) return <div className="p-10 text-center">用户未找到</div>;

  return (
    <div className="max-w-4xl mx-auto">
       <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md">
              {username.slice(0, 1).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">u/{profile.username}</h1>
              <p className="text-gray-500 text-sm mb-4">
                 Reddit 风格社交电商成员 • 加入于 {new Date(profile.date_joined).toLocaleDateString()}
              </p>
              
              <div className="flex justify-center sm:justify-start gap-6 mb-4 text-sm">
                  <div className="flex flex-col">
                      {/* 这里显示的 followers_count 现在是实时的了 */}
                      <span className="font-bold text-gray-900 text-lg">{profile.followers_count}</span>
                      <span className="text-gray-500">粉丝</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-lg">{profile.following_count}</span>
                      <span className="text-gray-500">正在关注</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-lg">{posts.length}</span>
                      <span className="text-gray-500">帖子</span>
                  </div>
              </div>

              <div className="flex justify-center sm:justify-start gap-3">
                  {/* (!!!) 传入回调函数 (!!!) */}
                  <FollowButton 
                    username={profile.username} 
                    initialIsFollowed={profile.is_followed}
                    onFollowChange={handleFollowChange} 
                  />
                  <button className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-200 border border-gray-200">
                    私信
                  </button>
              </div>
          </div>
       </div>
       
       <div className="space-y-4">
         <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-2 ml-1">发布的帖子</h3>
         {posts.length === 0 ? (
           <div className="text-center py-10 text-gray-500 bg-white rounded border border-gray-200">
              该用户还没有发布过任何内容。
           </div>
         ) : (
           posts.map(post => <PostCard key={post.id} post={post} />)
         )}
       </div>
    </div>
  );
}