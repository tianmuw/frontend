// components/CommentSection.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ApiComment } from '@/types';
import Comment from './Comment'; // 导入我们的子组件
import Link from 'next/link';

interface CommentSectionProps {
  postId: string; // 接收当前帖子的 ID
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { isAuthenticated, accessToken, user } = useAuth();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. 在组件加载时，获取评论列表
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          // (!!!) 调用我们测试过的 API (!!!)
          `${apiUrl}/api/v1/posts/${postId}/list_comments/`
        );
        setComments(response.data);
      } catch (error) {
        console.error("无法获取评论", error);
      }
    };
    fetchComments();
  }, [postId, apiUrl]); // 依赖 postId, 确保 ID 变化时重新获取

  // 2. 处理"发布"新评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !accessToken) {
      alert('请登录后发表评论。');
      return;
    }
    try {
      // (!!!) 调用我们测试过的 API (!!!)
      const response = await axios.post(
        `${apiUrl}/api/v1/posts/${postId}/create_comment/`,
        {
          content: newComment,
          parent: null, // (简化) 我们暂时只支持发布"顶级"评论
        },
        {
          headers: { Authorization: `JWT ${accessToken}` },
        }
      );

      // (!!) 关键: 发布成功后, 立即把新评论加到列表中 (!!)
      setComments([...comments, response.data]);
      setNewComment(''); // 清空输入框

    } catch (error) {
      console.error('发布评论失败', error);
      alert('发布评论失败。');
    }
  };

  return (
    <section>
      <h2>评论区</h2>

      {/* 3. 新评论表单 */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} style={{ margin: '1rem 0' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`以 ${user?.username} 的身份发表评论...`}
            required
            rows={3}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ marginTop: '8px', padding: '10px 15px' }}>
            发布评论
          </button>
        </form>
      ) : (
        <p>请 <Link href="/login" style={{color: '#0070f3'}}>登录</Link> 后发表评论。</p>
      )}

      {/* 4. 渲染评论树 */}
      <div style={{ background: '#f9f9f9', padding: '1px 1rem 1rem 1rem', borderRadius: '8px' }}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))
        ) : (
          <p>还没有评论，快来抢沙发吧！</p>
        )}
      </div>
    </section>
  );
}