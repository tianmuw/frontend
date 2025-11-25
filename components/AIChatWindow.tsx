// components/AIChatWindow.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ApiPost } from '@/types';
import Link from 'next/link';
import { getImageUrl } from '@/utils/url';

interface Message {
  role: 'user' | 'ai';
  content: string;
  recommendations?: ApiPost[];
}

export default function AIChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '👋 你好！我是你的 AI 购物助手。想买点什么？比如“推荐一款降噪耳机”或“适合送女友的礼物”。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { accessToken } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!accessToken) {
        setMessages(prev => [...prev, { role: 'ai', content: '请先登录，以便我为您提供个性化服务。' }]);
        return;
    }

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await axios.post(
        `${apiUrl}/api/v1/ai/chat/`, 
        { query: userMsg },
        { headers: { Authorization: `JWT ${accessToken}` } }
      );

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: res.data.answer,
        recommendations: res.data.recommendations 
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: '抱歉，我的大脑刚才短路了，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 迷你商品卡片组件
  const MiniCard = ({ post }: { post: ApiPost }) => (
    <div className="flex gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm mb-2 hover:border-blue-200 transition-colors">
        <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
            {post.product.product_image_url ? (
                <img src={post.product.product_image_url} className="w-full h-full object-cover" alt="product" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">无图</div>
            )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
            <Link href={`/posts/${post.id}`} className="text-sm font-bold text-gray-800 truncate hover:text-blue-600 hover:underline block">
                {post.product.product_title || post.title}
            </Link>
            <div className="flex justify-between items-end">
                <span className="text-xs text-orange-600 font-medium">
                    {post.product.product_price || '暂无报价'}
                </span>
                <Link href={`/posts/${post.id}`} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100">
                    查看详情
                </Link>
            </div>
        </div>
    </div>
  );

  return (
    <>
      {/* 1. 悬浮按钮 (右下角) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
            isOpen ? 'bg-gray-200 text-gray-600 rotate-90' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
        }`}
      >
        {isOpen ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
        )}
      </button>

      {/* 2. 聊天窗口 */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-96 h-[600px] max-h-[80vh] bg-gray-50 rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
            
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-bold text-gray-800">AI 导购助手</span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-auto">Beta</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                        }`}>
                            {msg.content}
                        </div>

                        {/* 如果有推荐商品 */}
                        {msg.recommendations && msg.recommendations.length > 0 && (
                            <div className="mt-3 w-[90%] max-w-[85%] space-y-2">
                                <p className="text-xs text-gray-500 font-bold ml-1">为您推荐：</p>
                                {msg.recommendations.map(post => (
                                    <MiniCard key={post.id} post={post} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-400 text-xs ml-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        思考中...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="我想买..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isLoading}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
      )}
    </>
  );
}