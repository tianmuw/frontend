// components/TopicJoinButton.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface TopicJoinButtonProps {
  slug: string;
  initialIsJoined?: boolean;
  className?: string; // 允许从外部自定义样式
}

export default function TopicJoinButton({ slug, initialIsJoined = false, className }: TopicJoinButtonProps) {
  const [isJoined, setIsJoined] = useState(initialIsJoined);
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, isAuthenticated } = useAuth();
  const router = useRouter();

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
    // 如果已加入，则调用 leave；否则调用 join
    const action = isJoined ? 'leave' : 'join'; 

    try {
      await axios.post(
        `${apiUrl}/api/v1/topics/${slug}/${action}/`,
        {}, // body 为空
        { headers: { Authorization: `JWT ${accessToken}` } }
      );

      // 成功后切换状态
      setIsJoined(!isJoined);

      // (可选) 刷新页面以更新订阅人数，或者我们只更新按钮状态
      // router.refresh(); 

    } catch (error) {
      console.error(`Failed to ${action} topic`, error);
      alert('操作失败，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  // 两种状态的样式
  const baseStyle = "px-4 py-1.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center min-w-[80px]";
  const joinedStyle = "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300"; // 已加入 (显示"已加入"或"退出")
  const notJoinedStyle = "bg-blue-600 text-white hover:bg-blue-700"; // 未加入 (显示"加入")

  return (
    <button 
      onClick={(e) => {
         e.preventDefault(); // 防止触发父级链接跳转
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