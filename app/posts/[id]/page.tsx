// app/posts/[id]/page.tsx (Tailwind 版)

import { ApiPost } from "@/types";
import Link from 'next/link';
import { use } from 'react';
import VoteButtons from "@/components/VoteButtons";
import CommentSection from '@/components/CommentSection';
import { getImageUrl } from '@/utils/url';
import PostMedia from '@/components/PostMedia';

interface PostPageProps {
  params: {
    id: string;
  };
}

async function getPostDetails(id: string): Promise<ApiPost | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiUrl}/api/v1/posts/${id}/`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch post details", error);
    return null;
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPostDetails(id);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
        <h1 className="text-2xl font-bold mb-2">帖子未找到</h1>
        <p className="mb-4">无法找到 ID 为 "{id}" 的帖子。</p>
        <Link href="/" className="text-blue-600 hover:underline">返回广场</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* 1. 帖子主卡片 */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden mb-4">
        <div className="p-4 sm:p-6">

          {/* Header: Meta Info */}
          <div className="flex items-center text-xs text-gray-500 mb-4 space-x-2">
            <Link
              href={`/topics/${post.topic.slug}`}
              className="font-bold text-gray-900 hover:underline flex items-center"
            >
              {post.topic.icon ? (
                <img
                  src={getImageUrl(post.topic.icon) || ''}
                  alt={post.topic.name}
                  className="w-6 h-6 rounded-full mr-2 object-cover border border-gray-200"
                />
              ) : (
                <span className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">#</span>
              )}
              t/{post.topic.name}
            </Link>
            <span>•</span>
            <span>发布者 u/{post.author.username}</span>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* 插入多媒体展示 */}
          <div className="mb-6">
             <PostMedia video={post.video} images={post.images} />
          </div>

          {/* Content */}
          <div className="text-gray-800 leading-relaxed mb-6 text-base whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Product Card */}
          {/* (!!!) 修复：只有当 product 存在时才渲染商品卡片 (!!!) */}
          {post.product && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start sm:items-center space-x-4 hover:bg-gray-100 transition-colors">
                {post.product.product_image_url ? (
                  <div className="flex-shrink-0 w-20 h-20 bg-white rounded border border-gray-200 overflow-hidden">
                     <img src={post.product.product_image_url} alt="Product" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">无图</div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                    {post.product.product_title || '关联商品'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">价格: <span className="text-orange-600 font-medium">{post.product.product_price || '暂无'}</span></p>
                  <a 
                    href={post.product.original_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors font-bold"
                  >
                    去购买 &rarr;
                  </a>
                </div>
            </div>
          )}

          {/* Footer: Actions (Vote & Share) */}
          <div className="flex items-center space-x-4 border-t border-gray-100 pt-4">
            <VoteButtons
              postId={post.id}
              initialScore={post.score}
              initialUserVote={post.user_vote}
            />

            <div className="flex items-center space-x-2 text-gray-500 text-sm font-bold px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
              </svg>
              <span>{post.comments_count} 评论</span>
            </div>

            <button className="flex items-center space-x-2 text-gray-500 text-sm font-bold px-2 py-1 rounded hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              <span>分享</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. 评论区容器 */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 sm:p-6">
        <CommentSection postId={id} />
      </div>

    </div>
  );
}