// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // 导入我们的钩子

export default function Navbar() {
  // 1. 从全局状态中获取 user 和 logout 函数
  const { user, logout } = useAuth();

  const navStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: '#f5f5f5',
    borderBottom: '1px solid #ddd',
  };

  const linkStyle: React.CSSProperties = {
    margin: '0 0.5rem',
    textDecoration: 'none',
    color: '#333',
  };

  const buttonStyle: React.CSSProperties = {
    ...linkStyle,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#0070f3',
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link href="/" style={{ ...linkStyle, fontWeight: 'bold' }}>
          广场
        </Link>
      </div>
      <div>
        {/* 2. (关键) 检查 user 是否存在 */}
        {user ? (
          // 已登录
          <>
            <span style={linkStyle}>
              欢迎, <strong>{user.username}</strong>
            </span>
            <Link href="/create-post" style={linkStyle}> {/* (下一步创建) */}
              发布帖子
            </Link>
            <button onClick={logout} style={buttonStyle}>
              注销
            </button>
          </>
        ) : (
          // 未登录
          <>
            <Link href="/login" style={linkStyle}>
              登录
            </Link>
            <Link href="/register" style={linkStyle}> {/* (下一步创建) */}
              注册
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}