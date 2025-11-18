// components/VoteButtons.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// 1. 定义 props 类型
interface VoteButtonsProps {
  postId: number;
  initialScore: number;
  initialUserVote: number | null; // 1 (顶), -1 (踩), or null (未投)
}

export default function VoteButtons({ postId, initialScore, initialUserVote }: VoteButtonsProps) {
  const { accessToken, isAuthenticated } = useAuth();
  const router = useRouter(); // (如果未登录，需要跳转)

  // 2. (关键) 用 useState 管理"本地"状态
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  // 3. 处理投票的函数
  const handleVote = async (newVoteType: 1 | -1) => {
    if (!isAuthenticated) {
      alert('请先登录再投票！');
      router.push('/login');
      return;
    }

    if (isLoading) return; // 防止重复点击
    setIsLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    let newScore = score;
    let newLocalUserVote = userVote;

    // 4. (!!) 乐观更新 (Optimistic Update) (!!)
    //    我们先在前端更新 UI，让用户感觉非常快
    if (userVote === newVoteType) {
      // 4a. 取消投票 (顶 -> 顶)
      newScore -= newVoteType;
      newLocalUserVote = null;
    } else if (userVote !== null) {
      // 4b. 改变投票 (顶 -> 踩)
      newScore -= userVote; // 减去旧的
      newScore += newVoteType; // 加上新的
      newLocalUserVote = newVoteType;
    } else {
      // 4c. 首次投票 (null -> 顶)
      newScore += newVoteType;
      newLocalUserVote = newVoteType;
    }

    // 立即更新前端 UI
    setScore(newScore);
    setUserVote(newLocalUserVote);

    // 5. 然后，在后台真正地调用 API
    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/posts/${postId}/vote/`,
        { vote_type: newVoteType }, // 发送 { "vote_type": 1 }
        {
          headers: { Authorization: `JWT ${accessToken}` },
        }
      );

      // 6. (!! 关键 !!) 用 API 返回的"真实"分数来同步状态
      //    这可以防止我们的前端和后端分数不一致
      setScore(response.data.score);

    } catch (error) {
      console.error("投票失败", error);
      // 7. (回滚) 如果 API 调用失败，我们把状态滚回原样
      setScore(initialScore);
      setUserVote(initialUserVote);
      alert('投票失败，请重试。');
    } finally {
      setIsLoading(false); // 允许再次点击
    }
  };

  // (为 'useRouter' 导入)
  // 在文件顶部添加: import { useRouter } from 'next/navigation';

  // 8. 渲染按钮
  const buttonStyle = (type: 1 | -1): React.CSSProperties => ({
    padding: '5px 10px',
    fontSize: '1.2rem',
    cursor: isLoading ? 'wait' : 'pointer',
    border: '1px solid #ccc',
    // (新) 根据 userVote 高亮按钮
    color: userVote === type ? (type === 1 ? 'green' : 'red') : '#333',
    fontWeight: userVote === type ? 'bold' : 'normal',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button onClick={() => handleVote(1)} style={buttonStyle(1)}>▲</button>
      <strong style={{ minWidth: '30px', textAlign: 'center' }}>{score}</strong>
      <button onClick={() => handleVote(-1)} style={buttonStyle(-1)}>▼</button>
    </div>
  );
}