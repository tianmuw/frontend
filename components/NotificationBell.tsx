// components/NotificationBell.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ApiNotification } from '@/types';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const { accessToken, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. 获取未读数量 (挂载时执行)
  useEffect(() => {
    if (!accessToken) return;
    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/v1/notifications/unread_count/`, {
          headers: { Authorization: `JWT ${accessToken}` }
        });
        setUnreadCount(res.data.count);
      } catch (e) { console.error(e); }
    };
    // 轮询或者简单的单次获取。这里我们只做单次。
    fetchUnreadCount();
  }, [accessToken, apiUrl]);

  // 2. 点击铃铛: 切换下拉菜单 & 加载列表
  const toggleDropdown = async () => {
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState && accessToken) {
      setLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/api/v1/notifications/`, {
            headers: { Authorization: `JWT ${accessToken}` }
        });
        setNotifications(res.data.results || res.data);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    }
  };

  // 3. 点击通知: 标记已读并跳转
  const handleNotificationClick = async (notification: ApiNotification) => {
    // 先关闭下拉
    setIsOpen(false);

    // 如果未读，标记为已读
    if (!notification.is_read && accessToken) {
        try {
            await axios.post(`${apiUrl}/api/v1/notifications/${notification.id}/read/`, {}, {
                headers: { Authorization: `JWT ${accessToken}` }
            });
            // 更新本地状态 (减红点)
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { console.error(e); }
    }

    // 跳转逻辑
    if (notification.notification_type === 'follow') {
        router.push(`/users/${notification.actor.username}`);
    } else if (notification.notification_type === 'message') {
        // 私信跳转
        // 点击通知跳转到私信列表页，或者我们可以更智能地去请求 conversation_id
        // 简单起见，跳到消息中心
        router.push(`/messages`); 
    } else if (notification.post_id) {
        router.push(`/posts/${notification.post_id}`);
    }
  };

  // 4. 一键已读
  const markAllAsRead = async () => {
      if (!accessToken) return;
      try {
          await axios.post(`${apiUrl}/api/v1/notifications/mark_all_read/`, {}, {
              headers: { Authorization: `JWT ${accessToken}` }
          });
          setUnreadCount(0);
          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (e) { console.error(e); }
  };

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 铃铛按钮 */}
      <button 
        onClick={toggleDropdown}
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors relative"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        
        {/* 红点 (Badge) */}
        {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm">通知</h3>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
                        全部已读
                    </button>
                )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-6 text-center text-gray-400 text-sm">加载中...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">暂无通知</div>
                ) : (
                    notifications.map(note => (
                        <div 
                            key={note.id}
                            onClick={() => handleNotificationClick(note)}
                            className={`px-4 py-3 flex gap-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${!note.is_read ? 'bg-blue-50/50' : ''}`}
                        >
                            {/* 图标/头像 */}
                            <div className="flex-shrink-0 mt-1">
                                {note.actor.avatar ? (
                                    <img src={note.actor.avatar} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                        {note.actor.username[0].toUpperCase()}
                                    </div>
                                )}
                                {/* 小图标叠加 */}
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                    {note.notification_type === 'follow' && <span className="text-xs">👤</span>}
                                    {note.notification_type === 'comment' && <span className="text-xs">💬</span>}
                                    {note.notification_type === 'reply' && <span className="text-xs">↩️</span>}
                                    {note.notification_type === 'message' && <span className="text-xs">✉️</span>}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 leading-snug">
                                    <span className="font-bold text-black mr-1">{note.actor.username}</span>
                                    {note.notification_type === 'follow' && '关注了你'}
                                    {note.notification_type === 'comment' && '评论了你的帖子'}
                                    {note.notification_type === 'reply' && '回复了你的评论'}
                                    {note.notification_type === 'message' && '给你发了私信'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(note.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            
                            {/* 未读蓝点 */}
                            {!note.is_read && (
                                <div className="self-center w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
      )}
    </div>
  );
}