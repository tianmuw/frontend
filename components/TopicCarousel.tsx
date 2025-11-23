// components/TopicCarousel.tsx (修复版)
'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ApiTopic } from '@/types';
import { getImageUrl } from '@/utils/url'; // (!!) 导入

export default function TopicCarousel() {
  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/api/v1/topics/`);
        
        // (!!!) 调试日志 (!!!)
        console.log("TopicCarousel API Response:", res.data); 

        let data: ApiTopic[] = [];

        // 1. 如果直接是数组
        if (Array.isArray(res.data)) {
            data = res.data;
        } 
        // 2. 如果是分页对象 (包含 results)
        else if (res.data && Array.isArray(res.data.results)) {
            data = res.data.results;
        }
        
        setTopics(data.slice(0, 10));

      } catch (e) { console.error("Failed to fetch topics for carousel", e); }
    };
    fetchTrendingTopics();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 304; 
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;
      scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
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

      {/* 左按钮 */}
      <button onClick={() => scroll('left')} className="absolute left-2 top-[60%] -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg text-gray-800 p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 border border-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
      </button>

      <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {topics.map((topic, index) => {
          // (!!) 使用 getImageUrl 处理图片路径 (!!)
          const bannerUrl = getImageUrl(topic.banner);
          const iconUrl = getImageUrl(topic.icon);

          return (
            <Link key={topic.id} href={`/topics/${topic.slug}`} className="relative z-10 flex-shrink-0 w-72 h-40 rounded-xl overflow-hidden snap-start hover:scale-[1.02] transition-transform shadow-md group cursor-pointer bg-gray-800">
                {/* 背景图 */}
                {bannerUrl ? (
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${bannerUrl})` }}></div>
                ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)}`}></div>
                )}

                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>

                <div className="absolute bottom-0 left-0 p-4 text-white w-full">
                   <div className="flex items-center gap-2 mb-2">
                      {/* 小图标 */}
                      {iconUrl ? (
                          <img src={iconUrl} alt={topic.name} className="w-8 h-8 rounded-full border-2 border-white/50 object-cover" />
                      ) : (
                          <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-xs font-bold border border-white/30">t/</div>
                      )}
                      <span className="text-sm font-bold opacity-90 truncate">t/{topic.name}</span>
                   </div>
                   <h3 className="font-bold text-lg leading-tight truncate mb-1">
                      {topic.description ? topic.description : `加入 ${topic.name} 社区`}
                   </h3>
                   <p className="text-xs font-medium opacity-75">
                      {topic.subscribers_count || 0} 成员 • {topic.posts_count || 0} 帖子
                   </p>
                </div>
            </Link>
          );
        })}
      </div>

      {/* 右按钮 */}
      <button onClick={() => scroll('right')} className="absolute right-2 top-[60%] -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg text-gray-800 p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 border border-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
      </button>
    </div>
  );
}