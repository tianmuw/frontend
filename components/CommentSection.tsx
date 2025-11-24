// components/CommentSection.tsx (Tailwind 版)
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { ApiComment } from '@/types';
import Comment from './Comment';
import CommentForm from './CommentForm';
import { getImageUrl } from '@/utils/url';

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // WebSocket 引用
  const socketRef = useRef<WebSocket | null>(null);

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

  // 1. 初始加载
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 2. WebSocket 实时监听
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = 'localhost:8000'; // 生产环境请改为 process.env.NEXT_PUBLIC_WS_HOST 或 window.location.host
    // 注意: 帖子评论是公开的，不需要 Token 也能连接
    const wsUrl = `${wsProtocol}//${wsHost}/ws/posts/${postId}/`;
    
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_comment') {
            const newComment = data.comment;
            // 处理头像 URL (因为后端 signal 传过来可能是相对路径)
            if (newComment.author.avatar) {
                newComment.author.avatar = getImageUrl(newComment.author.avatar);
            }
            
            // 将新评论追加到列表
            // (注意：这里简单追加到末尾。如果是回复，前端逻辑会比较复杂，
            //  为了 MVP 简单起见，收到任何新评论我们都简单地重新 fetch 一次是最稳妥的)
            fetchComments(); 
        }
    };

    socketRef.current = socket;
    return () => socket.close();
  }, [postId, fetchComments]); // 依赖 fetchComments

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