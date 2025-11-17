// app/login/page.tsx (新版本)
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// 1. 导入 useAuth 钩子
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // 2. 获取 AuthContext 中的 login 函数
  const { login } = useAuth(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const response = await axios.post(`${apiUrl}/api/v1/auth/jwt/create/`, {
        username: username,
        password: password,
      });

      if (response.data.access) {
        // 3. (关键) 不再操作 localStorage，而是调用全局 login 函数
        login(response.data.access, response.data.refresh);

        // 4. 跳转到首页
        router.push('/'); 
      }
    } catch (err: any) {
      console.error('Login failed', err);
      if (err.response && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('登录失败，请重试。');
      }
    }
  };

  // ... (表单的 JSX 部分保持不变) ...
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto' }}>
      <h1>登录</h1>
      <form onSubmit={handleSubmit}>
        {/* ... (用户名 input) ... */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username">用户名:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        {/* ... (密码 input) ... */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">密码:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 15px' }}>
          登录
        </button>
      </form>
    </main>
  );
}