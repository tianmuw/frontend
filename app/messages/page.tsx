// app/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
  const { accessToken, user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) return;
    
    const fetchConversations = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.get(`${apiUrl}/api/v1/chat/conversations/`, {
                headers: { Authorization: `JWT ${accessToken}` }
            });
            setConversations(res.data);
        } catch (e) { console.error(e); }
    };
    fetchConversations();
  }, [accessToken]);

  // 辅助函数: 获取对话中"对方"的名字
  const getOtherParticipant = (participants: any[]) => {
      return participants.find(p => p.username !== user?.username) || participants[0];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">消息中心</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {conversations.length === 0 ? (
              <div className="p-10 text-center text-gray-500">暂无消息</div>
          ) : (
              <div className="divide-y divide-gray-100">
                  {conversations.map(conv => {
                      const otherUser = getOtherParticipant(conv.participants);
                      return (
                        <Link 
                            key={conv.id} 
                            href={`/messages/${conv.id}`}
                            className="block p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                {otherUser.username[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-900 truncate">
                                        {otherUser.username}
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                        {new Date(conv.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {conv.last_message ? conv.last_message.content : '开始聊天吧'}
                                </p>
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