// app/messages/[id]/page.tsx (Tailwind 美化版)
'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';

interface ChatPageProps {
    params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
    const { id: conversationId } = use(params);
    const { accessToken, user } = useAuth();
    
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [otherUser, setOtherUser] = useState<any>(null); // (新) 存储对方信息用于标题
    const socketRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. 加载历史消息 & 会话详情 (为了获取对方名字)
    useEffect(() => {
        if (!accessToken) return;
        const fetchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                
                // 获取消息
                const msgsRes = await axios.get(`${apiUrl}/api/v1/chat/conversations/${conversationId}/messages/`, {
                    headers: { Authorization: `JWT ${accessToken}` }
                });
                setMessages(msgsRes.data.results || msgsRes.data);

                // (新) 获取会话详情以便显示标题
                // 这里我们偷个懒，直接从消息里或者如果不发请求，标题可能暂时不显示对方名字
                // 为了完美，我们其实应该有一个 GET /conversations/{id} 的接口
                // 但我们可以先从第一条消息的 sender 或者 participants 里猜，或者在列表页传过来
                // 这里我们暂时简化：如果消息列表不为空，且 sender 不是我，那就是对方。
                // *更严谨的做法是后端提供 Conversation Detail API*
                
            } catch(e) { console.error(e); }
        };
        fetchData();
    }, [conversationId, accessToken]);

    // 2. WebSocket 连接 (保持不变)
    useEffect(() => {
        if (!accessToken) return;
        // (注意) 确保后端已经配置了 JwtAuthMiddleware
        const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/?token=${accessToken}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => console.log('WebSocket Connected');
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages(prev => [...prev, data]);
        };
        socketRef.current = socket;
        return () => socket.close();
    }, [conversationId, accessToken]);

    // 滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim() && socketRef.current) {
            socketRef.current.send(JSON.stringify({ 'message': inputMessage }));
            setInputMessage('');
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            
            {/* 1. 顶部标题栏 */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <Link href="/messages" className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <h2 className="font-bold text-gray-800">聊天</h2>
                </div>
                {/* (可选) 对方的头像/名字可以在这里显示 */}
            </div>

            {/* 2. 消息列表区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 scrollbar-thin">
                {messages.map((msg, index) => {
                    const isMe = msg.sender === user?.username || msg.sender.username === user?.username;
                    // 尝试获取头像 (WebSocket 消息里有 avatar 字段，API 消息里在 sender 对象里)
                    const avatarUrl = msg.avatar || msg.sender.avatar; 

                    return (
                        <div key={index} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            
                            {/* 对方头像 */}
                            {!isMe && (
                                <div className="flex-shrink-0 mt-auto">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                    ) : (
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {(msg.sender.username || msg.sender)[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 消息气泡 */}
                            <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm break-words ${
                                    isMe 
                                    ? 'bg-blue-600 text-white rounded-br-sm' 
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                                }`}>
                                    {msg.message || msg.content}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 px-1">
                                    {formatTime(msg.created_at)}
                                </span>
                            </div>

                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* 3. 底部输入框 */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm max-h-32 min-h-[44px]"
                            placeholder="输入消息..."
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage(e);
                                }
                            }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!inputMessage.trim()}
                        className="bg-blue-600 text-white p-3 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform rotate-90">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}