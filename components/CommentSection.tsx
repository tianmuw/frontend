// components/CommentSection.tsx (Tailwind 版)
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ApiComment } from '@/types';
import Comment from './Comment';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/v1/posts/${postId}/list_comments/`
      );
      setComments(response.data);
    } catch (error) {
      console.error("无法获取评论", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, apiUrl]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mt-4">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
        全部评论 
        <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {/* 如果你想显示评论总数，这里可以加 */}
        </span>
      </h3>

      {/* 顶级评论表单 */}
      <div className="mb-8">
         <CommentForm
            postId={postId}
            parentId={null}
            onCommentPosted={fetchComments}
          />
      </div>
      
      {/* 评论列表 */}
      <div className="space-y-6">
        {isLoading ? (
           <p className="text-gray-500 text-center py-4">加载评论中...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Comment 
              key={comment.id} 
              comment={comment}
              postId={postId}
              onCommentPosted={fetchComments} 
            />
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500">还没有评论，快来抢沙发吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}