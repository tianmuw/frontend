// components/VoteButtons.tsx (Tailwind 版 - 横向胶囊风格)
'use client';

import { useState, useEffect } from 'react'; // 添加 useEffect 以便同步 server 端的 score
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface VoteButtonsProps {
  postId: number;
  initialScore: number;
  initialUserVote: number | null;
}

export default function VoteButtons({ postId, initialScore, initialUserVote }: VoteButtonsProps) {
  const { accessToken, isAuthenticated } = useAuth();
  const router = useRouter();

  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  // (修复) 当 props 变化时更新 state (例如列表刷新时)
  useEffect(() => {
    setScore(initialScore);
    setUserVote(initialUserVote);
  }, [initialScore, initialUserVote]);

  const handleVote = async (newVoteType: 1 | -1) => {
    if (!isAuthenticated) {
      // 使用浏览器原生的 confirm 稍微优雅一点，或者直接跳
      if (confirm('请先登录再投票！是否去登录？')) {
        router.push('/login');
      }
      return;
    }
    if (isLoading) return;
    setIsLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    let newScore = score;
    let newLocalUserVote = userVote;

    if (userVote === newVoteType) {
      newScore -= newVoteType;
      newLocalUserVote = null;
    } else if (userVote !== null) {
      newScore -= userVote;
      newScore += newVoteType;
      newLocalUserVote = newVoteType;
    } else {
      newScore += newVoteType;
      newLocalUserVote = newVoteType;
    }

    setScore(newScore);
    setUserVote(newLocalUserVote);

    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/posts/${postId}/vote/`,
        { vote_type: newVoteType },
        { headers: { Authorization: `JWT ${accessToken}` } }
      );
      setScore(response.data.score);
    } catch (error) {
      console.error("投票失败", error);
      setScore(initialScore);
      setUserVote(initialUserVote);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // (Tailwind) 灰色胶囊背景，圆角，内部 flex 布局
    <div className="flex items-center bg-gray-100 rounded-full px-2 py-1 space-x-1">
      {/* 顶按钮 */}
      <button 
        onClick={(e) => { e.preventDefault(); handleVote(1); }}
        className={`p-1 rounded hover:bg-gray-200 transition-colors ${
          userVote === 1 ? 'text-orange-600' : 'text-gray-500'
        }`}
      >
        {/* SVG 向上箭头 */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
      </button>

      {/* 分数 (加粗) */}
      <span className={`text-sm font-bold min-w-[1.5rem] text-center ${
          userVote === 1 ? 'text-orange-600' : (userVote === -1 ? 'text-blue-600' : 'text-gray-700')
      }`}>
        {score}
      </span>

      {/* 踩按钮 */}
      <button 
        onClick={(e) => { e.preventDefault(); handleVote(-1); }}
        className={`p-1 rounded hover:bg-gray-200 transition-colors ${
          userVote === -1 ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
         {/* SVG 向下箭头 */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
        </svg>
      </button>
    </div>
  );
}