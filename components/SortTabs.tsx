// components/SortTabs.tsx
'use client'; // 这个组件需要客户端交互来获取当前路径

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation'; // 导入 hooks

export default function SortTabs() {
  // 1. 获取 URL search/query 参数 (例如 ?sort=hot)
  const searchParams = useSearchParams();
  // 2. 获取当前 URL 路径 (例如 / 或 /topics/huashan-travel)
  const pathname = usePathname();

  // 3. 获取当前的排序方式 (默认为 'new')
  const currentSort = searchParams.get('sort') || 'new';

  // 4. 定义一个辅助函数来创建链接
  const createSortLink = (sortType: 'new' | 'hot') => {
    // 创建一个新的 URLSearchParams 对象
    const params = new URLSearchParams(searchParams.toString());
    // 设置新的 'sort' 值
    params.set('sort', sortType);
    // 返回完整的 URL 字符串
    return `${pathname}?${params.toString()}`;
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 15px',
    textDecoration: 'none',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#0070f3' : '#333',
    borderBottom: isActive ? '3px solid #0070f3' : '3px solid transparent',
  });

  return (
    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ddd', marginBottom: '1rem' }}>
      {/* 5. "热门" 按钮 */}
      <Link href={createSortLink('hot')} style={tabStyle(currentSort === 'hot')}>
        🔥 热门
      </Link>

      {/* 6. "最新" 按钮 */}
      <Link href={createSortLink('new')} style={tabStyle(currentSort === 'new')}>
        ✨ 最新
      </Link>
    </div>
  );
}