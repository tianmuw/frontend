// components/PostCard.tsx (修复图标版)
'use client';

import { ApiPost } from "@/types";
import Link from 'next/link';
import VoteButtons from './VoteButtons';

interface PostCardProps {
  post: ApiPost;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors overflow-hidden">
      <div className="p-3 sm:p-4">
        
        {/* 1. 顶部元数据: 修复图标和 t/ 前缀 */}
        <div className="flex items-center text-xs text-gray-500 mb-2 space-x-2">
          <Link 
            href={`/topics/${post.topic.slug}`} 
            className="font-bold text-gray-900 hover:underline flex items-center"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* (!!!) 图标逻辑 (!!!) */}
            {post.topic.icon ? (
                <img 
                  src={post.topic.icon} 
                  alt={post.topic.name} 
                  className="w-5 h-5 rounded-full mr-1 object-cover border border-gray-100" 
                />
            ) : (
                <span className="bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center mr-1 text-[10px]">#</span>
            )}
            
            {/* (!!!) 添加 t/ 前缀 (!!!) */}
            <span>t/{post.topic.name}</span>
          </Link>

          <span>•</span>
          
          {/* 用户信息 */}
          <span className="flex items-center">
             发布者 
             <Link 
                href={`/users/${post.author.username}`} 
                className="ml-1 hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
             >  
                {/* (可选) 显示用户小头像 */}
                {post.author.avatar && (
                  <img src={post.author.avatar} className="w-4 h-4 rounded-full object-cover" />
                )}
                <strong>u/{post.author.username}</strong>
             </Link>
          </span>

          <span>•</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>

        {/* 2. 中间: 标题和内容 */}
        <Link href={`/posts/${post.id}`} className="block group">
          <h2 className="text-xl font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {post.content}
          </p>
        </Link>

        {/* 3. 关联商品 */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-100 rounded flex items-center space-x-3">
            {post.product.product_image_url ? (
              <img src={post.product.product_image_url} alt="Product" className="w-12 h-12 object-cover rounded bg-white" />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">无图</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {post.product.product_title || '商品加载中...'}
              </p>
              <a 
                href={post.product.original_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline cursor-pointer"
                onClick={(e) => e.stopPropagation()} 
              >
                去购买 &rarr;
              </a>
            </div>
        </div>

        {/* 4. 底部操作栏 */}
        <div className="flex items-center space-x-2 text-gray-500 text-sm font-bold">
          <VoteButtons 
            postId={post.id}
            initialScore={post.score}
            initialUserVote={post.user_vote}
          />

          <Link 
            href={`/posts/${post.id}`}
            className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
            </svg>
            <span>{post.comments_count} 评论</span>
          </Link>

          <button className="flex items-center space-x-1 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              <span className="hidden sm:inline">分享</span>
          </button>
        </div>

      </div>
    </div>
  );
}