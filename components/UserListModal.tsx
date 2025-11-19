// components/UserListModal.tsx (头像路径修复版)
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ApiUser } from '@/types';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
}

export default function UserListModal({ isOpen, onClose, title, endpoint }: UserListModalProps) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // (!!) 获取 API URL

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers: any = {};
        if (accessToken) headers['Authorization'] = `JWT ${accessToken}`;

        const res = await axios.get(`${apiUrl}${endpoint}`, { headers });
        setUsers(res.data.results || res.data);
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
            setError("该用户已隐藏此列表。");
        } else {
            console.error(err);
            setError("加载失败。");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, endpoint, accessToken, apiUrl]);

  // (!!!) 辅助函数：处理头像 URL (!!!)
  const getAvatarUrl = (url: string | null | undefined) => {
      if (!url) return null;
      if (url.startsWith('http')) return url; // 已经是绝对路径
      return `${apiUrl}${url}`; // 补全相对路径
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
                <p className="text-center text-gray-500 text-sm">加载中...</p>
            ) : error ? (
                <div className="text-center py-8 bg-gray-50 rounded">
                    <p className="text-gray-500 text-sm mb-2">🔒</p>
                    <p className="text-gray-600 text-sm">{error}</p>
                </div>
            ) : users.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">列表为空</p>
            ) : (
                <div className="space-y-3">
                    {users.map(u => {
                        // (!!!) 使用辅助函数获取正确 URL (!!!)
                        const avatarUrl = getAvatarUrl(u.avatar);

                        return (
                            <div key={u.id} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-200">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                                            {u.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <Link href={`/users/${u.username}`} onClick={onClose} className="font-bold text-gray-800 hover:text-blue-600 hover:underline truncate">
                                    u/{u.username}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}