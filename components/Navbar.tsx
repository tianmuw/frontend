'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 跳转到搜索页 (后面我们会实现这个页面)
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // 点击页面其他区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    // 固定在顶部，z-index 确保在最上层
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="flex items-center justify-between h-full px-4 max-w-[1800px] mx-auto">

        {/* 1. Logo */}
        <div className="flex items-center min-w-[40px] lg:min-w-[200px]">
          <Link href="/" className="flex items-center gap-2">
            {/* 简单的 Logo 图标 */}
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              S
            </div>
            <span className="text-xl font-bold text-gray-900 hidden lg:block">SocialShop</span>
          </Link>
        </div>

        {/* 2. 中间搜索框 (手机上简化或隐藏，这里我们让它自适应宽度) */}
        <div className="flex-1 max-w-2xl px-2 lg:px-4">
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

        {/* 3. 右侧用户菜单(手机上只显示铃铛，电脑上显示完整菜单) */}
        <div className="flex items-center justify-end min-w-[40px] lg:min-w-[200px] gap-2 lg:gap-4">
          {user ? (
            <>
              {/* 发帖按钮 (仅在电脑显示，手机在底部) */}
              <Link
                href="/create-post"
                className="hidden md:flex items-center gap-1 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="font-medium">发帖</span>
              </Link>

              {/* 铃铛(双端都显示) */}
              <NotificationBell />

              {/* 头像下拉菜单 (仅在电脑显示，手机在底部"我的") */}
              <div 
                ref={dropdownRef}
                className="relative group h-full flex items-center" 
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setTimeout(() => setIsDropdownOpen(false), 100)}
              >
                <button 
                  className="flex items-center gap-2 border border-transparent hover:border-gray-200 p-1 rounded cursor-pointer py-2"
                  // 移动端点击按钮切换菜单（可选优化）
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}  
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden lg:block">{user.username}</span>
                  {/* 小箭头 (可选) */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {/* 下拉菜单 (简单实现) */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block overflow-hidden z-50
                                 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:bg-transparent"
                  style={{ display: isDropdownOpen ? 'block' : 'none' }}
                >
                  <Link href={`/users/${user.username}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100" onClick={() => setIsDropdownOpen(false)}>
                    个人主页
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsDropdownOpen(false)}>
                    用户设置
                  </Link>

                  {/* 商家入驻入口*/}
                  <Link href="/merchant/apply" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                    商家入驻
                  </Link>
                  <button onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
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