// components/Comment.tsx (完整替换)
'use client';

import { ApiComment } from '@/types';
import React, { useState } from 'react'; // (!!) 导入 useState
import CommentForm from './CommentForm'; // (!!) 导入表单

// (!!) 1. Props 现在需要 postId 和回调函数
interface CommentProps {
  comment: ApiComment;
  postId: string;
  onCommentPosted: () => void;
}

export default function Comment({ comment, postId, onCommentPosted }: CommentProps) {
  // (!!) 2. 新的状态：是否正在回复此评论?
  const [isReplying, setIsReplying] = useState(false);

  const commentStyle: React.CSSProperties = {
    border: '1px solid #eee',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '1rem',
    background: '#fff'
  };

  const repliesStyle: React.CSSProperties = {
    marginLeft: '2rem', 
    borderLeft: '2px solid #ddd',
    paddingLeft: '1rem',
    marginTop: '1rem',
  };

  const replyButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#0070f3',
    cursor: 'pointer',
    padding: '4px 0',
    fontSize: '0.9rem',
  };

  return (
    <div style={commentStyle}>
      {/* ... (作者和内容保持不变) ... */}
      <p style={{ margin: 0, fontSize: '0.9rem' }}>
        <strong>{comment.author.username}</strong>
        <span style={{ color: '#888', marginLeft: '10px' }}>
          {new Date(comment.created_at).toLocaleString()}
        </span>
      </p>
      <p style={{ marginTop: '0.5rem' }}>{comment.content}</p>

      {/* (!!) 3. 添加"回复"按钮 (!!) */}
      <button onClick={() => setIsReplying(!isReplying)} style={replyButtonStyle}>
        {isReplying ? '取消回复' : '回复'}
      </button>

      {/* (!!) 4. 如果正在回复, 就显示 CommentForm (!!) */}
      {isReplying && (
        <CommentForm
          postId={postId}
          parentId={comment.id} // (!!) 关键: parentId 是 *这条* 评论的 ID
          onCommentPosted={() => {
            setIsReplying(false); // 1. (成功后) 隐藏表单
            onCommentPosted();    // 2. (成功后) 调用 *顶级* 回调来刷新
          }}
          placeholderText={`回复 @${comment.author.username}...`}
        />
      )}

      {/* (!!) 5. 递归渲染回复 (!!）
          我们必须把 postId 和 onCommentPosted *再次*传递给下一层
      */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={repliesStyle}>
          {comment.replies.map((reply) => (
            <Comment 
              key={reply.id} 
              comment={reply}
              postId={postId} // (!!) 传递
              onCommentPosted={onCommentPosted} // (!!) 传递
            />
          ))}
        </div>
      )}
    </div>
  );
}