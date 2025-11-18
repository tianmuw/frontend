// components/Comment.tsx
'use client';

import { ApiComment } from '@/types';
import React from 'react';

interface CommentProps {
  comment: ApiComment;
}

export default function Comment({ comment }: CommentProps) {
  const commentStyle: React.CSSProperties = {
    border: '1px solid #eee',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '1rem',
    background: '#fff'
  };

  // "盖楼"的缩进样式
  const repliesStyle: React.CSSProperties = {
    marginLeft: '2rem', 
    borderLeft: '2px solid #ddd',
    paddingLeft: '1rem',
    marginTop: '1rem',
  };

  return (
    <div style={commentStyle}>
      {/* 1. 评论作者和时间 */}
      <p style={{ margin: 0, fontSize: '0.9rem' }}>
        <strong>{comment.author.username}</strong>
        <span style={{ color: '#888', marginLeft: '10px' }}>
          {/* 简单格式化一下日期 */}
          {new Date(comment.created_at).toLocaleString()}
        </span>
      </p>

      {/* 2. 评论内容 */}
      <p style={{ marginTop: '0.5rem' }}>{comment.content}</p>

      {/* (!!!) 这就是递归 (!!!) */}
      {/* 3. 如果有回复, 就渲染"回复"区域 */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={repliesStyle}>
          {/* 遍历所有回复, 并为每个回复再次渲染 <Comment> 组件 */}
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}