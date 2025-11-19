// app/users/[username]/page.tsx (集成弹窗版)
'use client';

import { useState, useEffect, use } from 'react';
import { ApiPost, ApiProfile } from "@/types";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";
import UserListModal from "@/components/UserListModal"; // (!!) 导入弹窗
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default function UserPage({ params }: UserPageProps) {
  const { username } = use(params);
  const { accessToken, isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChatting, setIsChatting] = useState(false);
  
  // (!!) 弹窗状态 (!!)
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);

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

  const handleFollowChange = (newIsFollowed: boolean) => {
    if (!profile) return;
    setProfile({
        ...profile,
        is_followed: newIsFollowed,
        followers_count: newIsFollowed 
            ? profile.followers_count + 1 
            : profile.followers_count - 1
    });
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
        if(confirm('私信需要先登录，是否去登录？')) router.push('/login');
        return;
    }
    if (user?.username === username) {
        alert("你不能给自己发私信。");
        return;
    }
    if (isChatting) return;
    setIsChatting(true);

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.post(
            `${apiUrl}/api/v1/chat/conversations/start/`,
            { username: username },
            { headers: { Authorization: `JWT ${accessToken}` } }
        );
        router.push(`/messages/${res.data.id}`);
    } catch (error) {
        console.error("Failed to start chat", error);
        alert("无法发起私信，请稍后重试。");
        setIsChatting(false);
    }
  };

  // (!!) 拉黑功能 (!!!)
  const handleBlock = async () => {
      if (!confirm(`确定要拉黑 u/${username} 吗？拉黑后你们将无法看到对方的帖子。`)) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await axios.post(
            `${apiUrl}/api/v1/profiles/${username}/block/`, 
            {}, 
            { headers: { Authorization: `JWT ${accessToken}` } }
        );
        alert('已拉黑。');
        router.push('/'); // 拉黑后跳回首页
      } catch (e) { alert('操作失败'); }
  };


  if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>;
  if (!profile) return <div className="p-10 text-center">用户未找到</div>;

  return (
    <div className="max-w-4xl mx-auto">
       <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm relative">
          
          {/* 头像 */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md overflow-hidden">
              {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : username.slice(0, 1).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">u/{profile.username}</h1>
              <p className="text-gray-500 text-sm mb-4">
                 Reddit 风格社交电商成员 • 加入于 {new Date(profile.date_joined).toLocaleDateString()}
              </p>
              
              <div className="flex justify-center sm:justify-start gap-6 mb-4 text-sm">
                  {/* (!!!) 点击打开粉丝弹窗 (!!!) */}
                  <button onClick={() => setModalType('followers')} className="flex flex-col hover:bg-gray-50 p-1 rounded transition">
                      <span className="font-bold text-gray-900 text-lg">{profile.followers_count}</span>
                      <span className="text-gray-500">粉丝</span>
                  </button>

                  {/* (!!!) 点击打开关注弹窗 (!!!) */}
                  <button onClick={() => setModalType('following')} className="flex flex-col hover:bg-gray-50 p-1 rounded transition">
                      <span className="font-bold text-gray-900 text-lg">{profile.following_count}</span>
                      <span className="text-gray-500">正在关注</span>
                  </button>
                  
                  <div className="flex flex-col p-1">
                      <span className="font-bold text-gray-900 text-lg">{posts.length}</span>
                      <span className="text-gray-500">帖子</span>
                  </div>
              </div>

              <div className="flex justify-center sm:justify-start gap-3">
                  <FollowButton 
                    username={profile.username} 
                    initialIsFollowed={profile.is_followed}
                    onFollowChange={handleFollowChange} 
                  />
                  
                  {user?.username !== username && (
                      <>
                        <button 
                            onClick={handleStartChat}
                            disabled={isChatting}
                            className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-200 border border-gray-200 disabled:opacity-50"
                        >
                            {isChatting ? '跳转中...' : '私信'}
                        </button>
                        
                        {/* 拉黑按钮 (小一点，放在旁边) */}
                        <button onClick={handleBlock} className="text-gray-400 hover:text-red-600 text-sm px-2" title="拉黑用户">
                            🚫
                        </button>
                      </>
                  )}
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

       {/* (!!!) 渲染弹窗 (!!!) */}
       <UserListModal 
          isOpen={modalType === 'followers'}
          onClose={() => setModalType(null)}
          title={`u/${username} 的粉丝`}
          endpoint={`/api/v1/profiles/${username}/followers/`}
       />
       <UserListModal 
          isOpen={modalType === 'following'}
          onClose={() => setModalType(null)}
          title={`u/${username} 关注的人`}
          endpoint={`/api/v1/profiles/${username}/following/`}
       />
    </div>
  );
}