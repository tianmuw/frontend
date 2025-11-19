// components/TopicJoinButton.tsx (修复版 - 增加状态同步)
'use client';

import { useState, useEffect } from 'react'; // (!!) 引入 useEffect
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface TopicJoinButtonProps {
  slug: string;
  initialIsJoined?: boolean;
  className?: string;
}

export default function TopicJoinButton({ slug, initialIsJoined = false, className }: TopicJoinButtonProps) {
  const [isJoined, setIsJoined] = useState(initialIsJoined);
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, isAuthenticated } = useAuth();
  const router = useRouter();

  // (!!!) 关键修复：监听 initialIsJoined 的变化 (!!!)
  // 当父组件(页面)获取到真实数据(true)时，这里会把内部状态也更新为 true
  useEffect(() => {
    setIsJoined(initialIsJoined);
  }, [initialIsJoined]);

  const handleJoinToggle = async () => {
    if (!isAuthenticated) {
       if (confirm('加入话题需要先登录，是否去登录？')) {
         router.push('/login');
       }
       return;
    }

    if (isLoading) return;
    setIsLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const action = isJoined ? 'leave' : 'join'; 

    try {
      await axios.post(
        `${apiUrl}/api/v1/topics/${slug}/${action}/`,
        {}, 
        { headers: { Authorization: `JWT ${accessToken}` } }
      );
      
      setIsJoined(!isJoined);
      // router.refresh(); 

    } catch (error) {
      console.error(`Failed to ${action} topic`, error);
      alert('操作失败，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const baseStyle = "px-4 py-1.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center min-w-[80px]";
  const joinedStyle = "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300"; 
  const notJoinedStyle = "bg-blue-600 text-white hover:bg-blue-700"; 

  return (
    <button 
      onClick={(e) => {
         e.preventDefault();
         e.stopPropagation();
         handleJoinToggle();
      }}
      disabled={isLoading}
      className={`${baseStyle} ${isJoined ? joinedStyle : notJoinedStyle} ${className || ''}`}
    >
      {isLoading ? '...' : (isJoined ? '已加入' : '加入')}
    </button>
  );
}