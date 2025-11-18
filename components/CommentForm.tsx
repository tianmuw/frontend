// components/CommentForm.tsx (Tailwind 版)
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';

interface CommentFormProps {
  postId: string;
  parentId: number | null;
  onCommentPosted: () => void;
  placeholderText?: string;
}

export default function CommentForm({ postId, parentId, onCommentPosted, placeholderText }: CommentFormProps) {
  const [content, setContent] = useState('');
  const { isAuthenticated, accessToken, user } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !accessToken) return;
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        `${apiUrl}/api/v1/posts/${postId}/create_comment/`,
        {
          content: content,
          parent: parentId,
        },
        {
          headers: { Authorization: `JWT ${accessToken}` },
        }
      );
      setContent('');
      onCommentPosted();
    } catch (error) {
      console.error('发布评论失败', error);
      alert('发布评论失败。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-sm text-gray-600">
        想要参与讨论？请先 <Link href="/login" className="text-blue-600 hover:underline font-medium">登录</Link> 或 <Link href="/register" className="text-blue-600 hover:underline font-medium">注册</Link>。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholderText || `以 ${user?.username} 的身份发表评论...`}
          required
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm text-gray-800 bg-white"
        />
        <div className="mt-2 flex justify-end">
           <button 
             type="submit" 
             disabled={isSubmitting || !content.trim()}
             className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             {isSubmitting ? '发布中...' : '发布评论'}
           </button>
        </div>
      </div>
    </form>
  );
}