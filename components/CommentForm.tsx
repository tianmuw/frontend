// components/CommentForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';

interface CommentFormProps {
  postId: string;
  parentId: number | null; // null = 顶级评论, number = 回复
  onCommentPosted: () => void; // (!!) 一个回调函数，告诉父组件"刷新"
  placeholderText?: string; // (可选) 自定义占位符
}

export default function CommentForm({ postId, parentId, onCommentPosted, placeholderText }: CommentFormProps) {
  const [content, setContent] = useState('');
  const { isAuthenticated, accessToken, user } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !accessToken) return;

    try {
      // (!!) 调用我们的 create_comment API (!!)
      await axios.post(
        `${apiUrl}/api/v1/posts/${postId}/create_comment/`,
        {
          content: content,
          parent: parentId, // (!!) 关键: 传入 parentId (!!）
        },
        {
          headers: { Authorization: `JWT ${accessToken}` },
        }
      );

      // 成功!
      setContent('');       // 1. 清空表单
      onCommentPosted();    // 2. (!!) 调用回调, 告诉父组件去刷新评论树 (!!)

    } catch (error) {
      console.error('发布评论失败', error);
      alert('发布评论失败。');
    }
  };

  // 如果未登录，不显示表单
  if (!isAuthenticated) {
    return (
      <p style={{ marginTop: '1rem' }}>
        请 <Link href="/login" style={{color: '#0070f3'}}>登录</Link> 后发表评论。
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholderText || `以 ${user?.username} 的身份发表评论...`}
        required
        rows={3}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <button type="submit" style={{ marginTop: '8px', padding: '10px 15px' }}>
        发布
      </button>
    </form>
  );
}