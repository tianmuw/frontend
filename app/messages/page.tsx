// app/messages/page.tsx (Tailwind 美化版)
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
  const { accessToken, user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
        // 简单保护，实际可用 useEffect 监听重定向
        return; 
    }
    
    const fetchConversations = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.get(`${apiUrl}/api/v1/chat/conversations/`, {
                headers: { Authorization: `JWT ${accessToken}` }
            });
            setConversations(res.data);
        } catch (e) { console.error(e); } finally {
            setLoading(false);
        }
    };
    fetchConversations();
  }, [accessToken]);

  const getOtherParticipant = (participants: any[]) => {
      return participants.find(p => p.username !== user?.username) || participants[0];
  };

  if (loading) return <div className="p-10 text-center text-gray-500">加载消息...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 px-2">消息中心</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {conversations.length === 0 ? (
              <div className="p-16 text-center">
                  <div className="text-4xl mb-4">📭</div>
                  <h3 className="text-lg font-medium text-gray-900">没有消息</h3>
                  <p className="text-gray-500 mt-2">当你开始和其他用户聊天时，消息会出现在这里。</p>
              </div>
          ) : (
              <div className="divide-y divide-gray-100">
                  {conversations.map(conv => {
                      const otherUser = getOtherParticipant(conv.participants);
                      return (
                        <Link 
                            key={conv.id} 
                            href={`/messages/${conv.id}`}
                            className="block p-4 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                {/* 头像 */}
                                <div className="flex-shrink-0">
                                    {otherUser.avatar ? (
                                        <img src={otherUser.avatar} alt={otherUser.username} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {otherUser.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* 内容 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                            {otherUser.username}
                                        </h3>
                                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                            {new Date(conv.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                        {conv.last_message ? conv.last_message.content : <span className="italic text-gray-400">开始新的聊天...</span>}
                                    </p>
                                </div>
                            </div>
                        </Link>
                      );
                  })}
              </div>
          )}
      </div>
    </div>
  );
}