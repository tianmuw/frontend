// components/TopicCarousel.tsx (修复滚动版)
'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ApiTopic } from '@/types';

export default function TopicCarousel() {
  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/api/v1/topics/`);
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setTopics(data.slice(0, 10));
      } catch (e) { console.error(e); }
    };
    fetchTrendingTopics();
  }, []);

  // (!!!) 修复：更可靠的滚动逻辑 (!!!)
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // 获取容器宽度或者卡片宽度
      // 我们的卡片是 w-72 (288px) + gap-4 (16px) = 304px
      const scrollAmount = 304; 
      
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  if (topics.length === 0) return null;

  const getGradient = (index: number) => {
    const gradients = [
        'from-purple-600 to-indigo-700',
        'from-pink-500 to-rose-600',
        'from-blue-500 to-cyan-600',
        'from-amber-500 to-orange-600',
        'from-emerald-500 to-teal-600',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="mb-8 relative group/carousel">
      
      <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider px-1 flex items-center gap-2">
        <span>🔥</span> 正在流行 (Trending Today)
      </h2>
      
      {/* 左侧按钮: 增加 z-index (z-20) 确保在卡片之上 */}
      <button 
        type="button"
        onClick={() => scroll('left')}
        className="absolute left-2 top-[60%] -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg text-gray-800 p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 border border-gray-100"
        aria-label="Scroll Left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* 滚动容器 */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar" 
        // 使用内联样式强制隐藏滚动条
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {topics.map((topic, index) => (
          <Link 
            key={topic.id} 
            href={`/topics/${topic.slug}`}
            // 增加 z-index (z-10) 但比按钮低
            className="relative z-10 flex-shrink-0 w-72 h-40 rounded-xl overflow-hidden snap-start hover:scale-[1.02] transition-transform shadow-md group cursor-pointer"
          >
            {/* {topic.icon ? (
               // 如果有图，显示图片
               <div 
                 className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                 style={{ backgroundImage: `url(${topic.icon})` }}
               ></div>
            ) : (
               // 如果没图，显示渐变色
               <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)}`}></div>
            )} */}
            {/* 优先级: banner > icon > 渐变色 */}
            {topic.banner ? (
               <div 
                 className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                 style={{ backgroundImage: `url(${topic.banner})` }}
               ></div>
            ) : topic.icon ? (
               // 如果只有 icon，也可以勉强用 icon 做背景（模糊一下效果更好）
               <div 
                 className="absolute inset-0 bg-cover bg-center blur-sm scale-110 transition-transform duration-500 group-hover:scale-125"
                 style={{ backgroundImage: `url(${topic.icon})` }}
               ></div>
            ) : (
               <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)}`}></div>
            )}

            {/* <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)}`}></div> */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>

            <div className="absolute bottom-0 left-0 p-4 text-white w-full">
               <div className="flex items-center gap-2 mb-2">
                  {topic.icon ? (
                      <img src={topic.icon} alt={topic.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  ) : (
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-xs font-bold border border-white/30">
                        t/
                      </div>
                  )}
                  <span className="text-sm font-bold opacity-90 truncate">t/{topic.name}</span>
               </div>
               
               <h3 className="font-bold text-lg leading-tight truncate mb-1">
                  {topic.description ? topic.description : `加入 ${topic.name} 社区`}
               </h3>
               
               <p className="text-xs font-medium opacity-75">
                  {/* 这里现在可以安全使用了 */}
                  {topic.subscribers_count || 0} 成员 • {topic.posts_count || 0} 帖子
               </p>
            </div>
          </Link>
        ))}
      </div>

      {/* 右侧按钮: 增加 z-index (z-20) */}
      <button 
        type="button"
        onClick={() => scroll('right')}
        className="absolute right-2 top-[60%] -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg text-gray-800 p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 border border-gray-100"
        aria-label="Scroll Right"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}