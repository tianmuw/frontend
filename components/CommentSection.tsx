// components/CommentSection.tsx (完整替换)
'use client';

import { useState, useEffect, useCallback } from 'react'; // (!!) 导入 useCallback
import axios from 'axios';
import { ApiComment } from '@/types';
import Comment from './Comment';      // 导入"子"
import CommentForm from './CommentForm';  // (!!) 导入"表单"

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. (!!) 我们把"获取评论"的逻辑提取到一个 useCallback 钩子中 (!!)
  //    useCallback 确保这个函数本身不会在每次渲染时都重新创建
  //    这使得我们可以安全地把它作为 prop 传递下去
  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/v1/posts/${postId}/list_comments/`
      );
      setComments(response.data);
    } catch (error) {
      console.error("无法获取评论", error);
    }
  }, [postId, apiUrl]); // 依赖 postId 和 apiUrl

  // 2. 在组件加载时，调用一次 fetchComments
  useEffect(() => {
    fetchComments();
  }, [fetchComments]); // (!!) 依赖 fetchComments 函数 (!!)

  return (
    <section>
      <h2>评论区</h2>

      {/* 3. (!!) 使用我们新的 CommentForm (!!)
          - parentId={null} 表示这是一个"顶级"评论表单
          - onCommentPosted={fetchComments} 告诉表单:"发布成功后, 调用 fetchComments 刷新！"
      */}
      <CommentForm
        postId={postId}
        parentId={null}
        onCommentPosted={fetchComments}
      />

      {/* 4. 渲染评论树 */}
      <div style={{ background: '#f9f9f9', padding: '1px 1rem 1rem 1rem', borderRadius: '8px' }}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            // 5. (!!) 把 postId 和 fetchComments 回调 *传递* 给子组件 (!!)
            <Comment 
              key={comment.id} 
              comment={comment}
              postId={postId}
              onCommentPosted={fetchComments} 
            />
          ))
        ) : (
          <p>还没有评论，快来抢沙发吧！</p>
        )}
      </div>
    </section>
  );
}