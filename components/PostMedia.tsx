// components/PostMedia.tsx
'use client';

import { ApiPostImage } from '@/types';
import { getImageUrl } from '@/utils/url';

interface PostMediaProps {
  video?: string | null;
  images?: ApiPostImage[];
}

export default function PostMedia({ video, images }: PostMediaProps) {
  const hasVideo = !!video;
  const hasImages = images && images.length > 0;

  if (!hasVideo && !hasImages) return null;

  // 1. 视频播放器
  if (hasVideo) {
    return (
      <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-black">
        <video 
          src={getImageUrl(video)} 
          controls 
          className="w-full max-h-[500px] mx-auto"
          // 防止点击视频时跳转到帖子详情（如果在外层有 Link）
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    );
  }

  // 2. 图片九宫格
  if (hasImages && images) {
    const count = images.length;
    
    // 根据图片数量决定网格列数
    let gridClass = "grid-cols-1";
    if (count === 2) gridClass = "grid-cols-2";
    else if (count >= 3) gridClass = "grid-cols-3"; // 3张及以上用3列

    // 最多显示 9 张
    const displayImages = images.slice(0, 9);

    return (
      <div className={`mt-3 grid gap-1 ${gridClass} rounded-lg overflow-hidden`}>
        {displayImages.map((img, index) => {
           const isLast = index === 8 && count > 9; // 如果超过9张，第9张显示 "+N"
           
           // 特殊布局处理：如果只有 1 张图，限制最大高度
           const imgStyle = count === 1 ? "max-h-[500px] object-contain bg-gray-100" : "aspect-square object-cover h-full w-full";

           return (
             <div key={img.id} className="relative cursor-pointer group">
                <img 
                    src={getImageUrl(img.image) || ''} 
                    alt={`Image ${index + 1}`} 
                    className={`w-full ${imgStyle} hover:opacity-95 transition-opacity`}
                />
                {/* 如果是最后一张且还有更多图 */}
                {isLast && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-bold">
                        +{count - 9}
                    </div>
                )}
             </div>
           );
        })}
      </div>
    );
  }

  return null;
}