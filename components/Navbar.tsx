// components/Navbar.tsx (Reddit 风格)
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 跳转到搜索页 (后面我们会实现这个页面)
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    // 固定在顶部，z-index 确保在最上层
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="flex items-center justify-between h-full px-4 max-w-[1800px] mx-auto">
        
        {/* 1. Logo */}
        <div className="flex items-center min-w-[200px]">
          <Link href="/" className="flex items-center gap-2">
             {/* 简单的 Logo 图标 */}
             <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                S
             </div>
             <span className="text-xl font-bold text-gray-900 hidden sm:block">SocialShop</span>
          </Link>
        </div>

        {/* 2. 中间搜索框 (占据剩余空间) */}
        <div className="flex-1 max-w-2xl px-4">
            <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    placeholder="搜索话题、帖子、商品..."
                />
            </form>
        </div>

        {/* 3. 右侧用户菜单 */}
        <div className="flex items-center justify-end min-w-[200px] gap-4">
          {user ? (
            <>
              <Link 
                href="/create-post" 
                className="hidden md:flex items-center gap-1 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="font-medium">发帖</span>
              </Link>

              <div className="relative group">
                 <button className="flex items-center gap-2 border border-transparent hover:border-gray-200 p-1 rounded cursor-pointer">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.username.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium hidden lg:block">{user.username}</span>
                 </button>
                 {/* 下拉菜单 (简单实现) */}
                 <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block">
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                        注销
                    </button>
                 </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="bg-blue-600 text-white px-6 py-1.5 rounded-full font-bold hover:bg-blue-700 text-sm whitespace-nowrap">
                登录 / 注册
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}