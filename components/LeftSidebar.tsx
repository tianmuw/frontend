// components/LeftSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LeftSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const menuItems = [
    { name: '广场 (Home)', href: '/', icon: '🏠' },
    { name: '热门 (Popular)', href: '/?sort=hot', icon: '🔥' },
  ];

  const personalItems = [
    { name: '关注 (Following)', href: '/feed/following', icon: 'Tm' }, // 暂时用 icon 替代
    { name: '私信 (Messages)', href: '/messages', icon: '💬' },
    { name: '个人主页', href: user ? `/users/${user.username}` : '/login', icon: '👤' },
  ];

  const LinkItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href;
    return (
      <Link 
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
            isActive ? 'bg-gray-200 text-black' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="text-xl">{item.icon}</span>
        <span className="font-medium text-sm">{item.name}</span>
      </Link>
    )
  }

  return (
    <aside className="w-64 fixed top-16 left-0 bottom-0 overflow-y-auto border-r border-gray-200 bg-white py-4 px-2 hidden lg:block z-40">
      <div className="mb-4">
        <p className="px-4 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Feeds</p>
        {menuItems.map((item) => <LinkItem key={item.name} item={item} />)}
      </div>

      <div className="border-t border-gray-200 pt-4 mb-4">
        <p className="px-4 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">User</p>
        {personalItems.map((item) => <LinkItem key={item.name} item={item} />)}
      </div>

      <div className="border-t border-gray-200 pt-4">
         <p className="px-4 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Topics</p>
         <Link href="/create-topic" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <span>➕</span>
            <span className="font-medium text-sm">创建话题</span>
         </Link>
      </div>
    </aside>
  );
}