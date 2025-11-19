// components/FollowButton.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface FollowButtonProps {
  username: string;
  initialIsFollowed?: boolean;
  className?: string;
  // (!!!) 新增：回调函数，当关注状态改变时通知父组件
  onFollowChange?: (isFollowed: boolean) => void; 
}

export default function FollowButton({ username, initialIsFollowed = false, className, onFollowChange }: FollowButtonProps) {
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsFollowed(initialIsFollowed);
  }, [initialIsFollowed]);

  if (user && user.username === username) {
    return null; 
  }

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
       if (confirm('关注用户需要先登录，是否去登录？')) {
         router.push('/login');
       }
       return;
    }

    if (isLoading) return;
    setIsLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    try {
      await axios.post(
        `${apiUrl}/api/v1/profiles/${username}/follow/`,
        {}, 
        { headers: { Authorization: `JWT ${accessToken}` } }
      );
      
      const newStatus = !isFollowed;
      setIsFollowed(newStatus);
      
      // (!!!) 关键：操作成功后，通知父组件更新数字 (!!!)
      if (onFollowChange) {
        onFollowChange(newStatus);
      }

    } catch (error) {
      console.error(`Failed to follow user`, error);
      alert('操作失败，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const baseStyle = "px-4 py-1 rounded-full text-sm font-bold transition-colors min-w-[80px] flex items-center justify-center";
  const followStyle = "bg-blue-600 text-white hover:bg-blue-700";
  const unfollowStyle = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-red-600 hover:border-red-300";

  return (
    <button 
      onClick={(e) => {
         e.preventDefault();
         e.stopPropagation();
         handleFollowToggle();
      }}
      disabled={isLoading}
      className={`${baseStyle} ${isFollowed ? unfollowStyle : followStyle} ${className || ''}`}
      onMouseEnter={(e) => { if(isFollowed) e.currentTarget.innerText = "取消关注"; }}
      onMouseLeave={(e) => { if(isFollowed) e.currentTarget.innerText = "已关注"; }}
    >
      {isLoading ? '...' : (isFollowed ? '已关注' : '关注')}
    </button>
  );
}