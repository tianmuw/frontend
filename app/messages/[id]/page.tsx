// app/messages/[id]/page.tsx
'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface ChatPageProps {
    params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
    const { id: conversationId } = use(params);
    const { accessToken, user } = useAuth();
    
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const socketRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. 加载历史消息
    useEffect(() => {
        if (!accessToken) return;
        const fetchHistory = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await axios.get(`${apiUrl}/api/v1/chat/conversations/${conversationId}/messages/`, {
                    headers: { Authorization: `JWT ${accessToken}` }
                });
                setMessages(res.data.results || res.data);
            } catch(e) { console.error(e); }
        };
        fetchHistory();
    }, [conversationId, accessToken]);

    // 2. 连接 WebSocket
    useEffect(() => {
        if (!accessToken) return;

        // (注意) 这里的 wsUrl 需要根据你的环境调整，如果是 HTTPS 则用 wss://
        // 我们后端在 8000 端口
        const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/?token=${accessToken}`;
        
        // (!!!) 问题：标准的 WebSocket API 不支持自定义 headers (Authorization)
        // 我们通常通过 URL query param 传递 token，然后在后端 middleware 中验证
        // 或者简单起见，我们利用 cookie (如果 session based)
        // 但既然我们用 JWT，我们还是尝试 query param 方式。
        // (如果你遇到 403，我们需要修改后端 AuthMiddlewareStack)
        
        // 暂时尝试直接连接 (假设 AuthMiddlewareStack 能处理 session, 或者我们之后加 query auth)
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('WebSocket Connected');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages(prev => [...prev, data]); // 追加新消息
        };

        socketRef.current = socket;

        return () => {
            socket.close();
        };
    }, [conversationId, accessToken]);

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim() && socketRef.current) {
            socketRef.current.send(JSON.stringify({
                'message': inputMessage
            }));
            setInputMessage('');
        }
    };

    return (
        <div className="max-w-2xl mx-auto h-[calc(100vh-100px)] flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, index) => {
                    const isMe = msg.sender === user?.username || msg.sender.username === user?.username;
                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg p-3 text-sm ${
                                isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                            }`}>
                                {!isMe && <p className="text-xs text-gray-400 mb-1">{msg.sender.username || msg.sender}</p>}
                                {msg.message || msg.content} 
                                {/* 兼容 WebSocket 消息格式(message) 和 API 格式(content) */}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* 输入框 */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="发送消息..."
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700">
                        发送
                    </button>
                </form>
            </div>
        </div>
    );
}