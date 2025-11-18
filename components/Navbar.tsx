// components/Navbar.tsx (Tailwind 版本)
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  // Tailwind: 我们不再需要 style={{...}} 对象了！

  return (
    // (!!) nav: 变成一个白色背景、有阴影的导航栏
    <nav className="bg-white shadow-md w-full">
      {/* (!!) 容器: 匹配 layout.tsx 的 max-w-4xl 和 mx-auto */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* 左侧: Logo/广场 */}
        <div>
          <Link href="/" className="font-bold text-xl text-blue-600 hover:text-blue-800">
            广场
          </Link>
        </div>

        {/* 右侧: 登录/用户信息 */}
        <div className="flex items-center space-x-4">
          {user ? (
            // (!!) 已登录状态 (!!)
            <>
              <span className="text-gray-700">
                欢迎, <strong>{user.username}</strong>
              </span>
              <Link 
                href="/create-post" 
                className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                发布帖子
              </Link>
              <button 
                onClick={logout} 
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                注销
              </button>
            </>
          ) : (
            // (!!) 未登录状态 (!!)
            <>
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                登录
              </Link>
              <Link 
                href="/register" 
                className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                注册
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}