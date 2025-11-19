// components/Comment.tsx (Tailwind 版 - Reddit 风格连线)
'use client';

import { ApiComment } from '@/types';
import React, { useState } from 'react';
import CommentForm from './CommentForm';
import Link from 'next/link';

interface CommentProps {
  comment: ApiComment;
  postId: string;
  onCommentPosted: () => void;
}

export default function Comment({ comment, postId, onCommentPosted }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);

  return (
    <div className="relative group">
      {/* 1. 评论头部: 竖线 (折叠线) + 头像 + 用户名 + 时间 */}
      <div className="flex items-center text-xs text-gray-500 mb-1.5">
        {/* 简单的头像占位符 */}
        {/* <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-600 font-bold text-[10px]">
            {comment.author.username.substring(0, 1).toUpperCase()}
        </div> */}
        {comment.author.avatar ? (
            <img 
                src={comment.author.avatar} 
                alt={comment.author.username} 
                className="w-6 h-6 rounded-full mr-2 object-cover border border-gray-100"
            />
        ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-600 font-bold text-[10px]">
                {comment.author.username.substring(0, 1).toUpperCase()}
            </div>
        )}
        
        <Link href={`/users/${comment.author.username}`} className="font-semibold text-gray-900 hover:underline">
            {comment.author.username}
        </Link>
        
        <span className="mx-1">•</span>
        <span>{new Date(comment.created_at).toLocaleString()}</span>
      </div>

      {/* 2. 评论内容容器 (左侧留出空间给连线) */}
      <div className="ml-3 pl-4 border-l-2 border-gray-200 hover:border-gray-400 transition-colors">
          
          {/* 内容 */}
          <div className="text-sm text-gray-800 leading-relaxed break-words">
              {comment.content}
          </div>

          {/* 底部操作栏 (回复) */}
          <div className="mt-2 mb-2 flex items-center gap-4">
              <button 
                onClick={() => setIsReplying(!isReplying)} 
                className="flex items-center text-xs font-bold text-gray-500 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                {isReplying ? '取消回复' : '回复'}
              </button>
              
              {/* (可选) 可以在这里加点赞/分享按钮 */}
          </div>

          {/* 回复表单 */}
          {isReplying && (
            <div className="mt-2 mb-4">
                <CommentForm
                postId={postId}
                parentId={comment.id}
                onCommentPosted={() => {
                    setIsReplying(false);
                    onCommentPosted();
                }}
                placeholderText={`回复 @${comment.author.username}...`}
                />
            </div>
          )}

          {/* (!!!) 递归渲染子回复 (!!!) */}
          {/* 这里不需要额外的 margin/padding, 因为父级 div 已经有了 border-l 和 pl-4 */}
          {/* 每一层递归都会自动添加一道左侧边框，形成视觉上的层级树 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="flex flex-col gap-4 mt-3">
              {comment.replies.map((reply) => (
                <Comment 
                  key={reply.id} 
                  comment={reply}
                  postId={postId}
                  onCommentPosted={onCommentPosted} 
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}