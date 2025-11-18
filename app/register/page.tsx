// app/register/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // 导入 useAuth 以便自动登录

export default function RegisterPage() {
  // 1. (新) 我们需要更多 state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState(''); // 确认密码
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { login } = useAuth(); // (!!) 获取全局 login 函数
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 2. (!!) 客户端验证 (!!)
    if (password !== passwordConfirm) {
      setError('两次输入的密码不一致！');
      return; // 停止提交
    }

    try {
      // 3. (!!) 第一步：调用 Djoser 的"创建用户" API (!!)
      await axios.post(`${apiUrl}/api/v1/auth/users/`, {
        username: username,
        email: email,
        password: password,
      });

      // 4. (!!) 注册成功！现在自动为他们登录 (!!)
      //    (这是我们之前在 "login" 页面用过的代码)
      const loginResponse = await axios.post(`${apiUrl}/api/v1/auth/jwt/create/`, {
        username: username,
        password: password,
      });

      if (loginResponse.data.access) {
        // 5. (!!) 调用全局 login 函数 (!!)
        login(loginResponse.data.access, loginResponse.data.refresh);

        // 6. (!!) 欢迎新用户！跳转到首页 (!!)
        router.push('/');
      }

    } catch (err: any) {
      // 7. 处理注册失败 (例如: 用户名已存在, 邮箱格式错误)
      console.error('Registration failed', err);
      if (err.response && err.response.data) {
        // Djoser 会返回详细的错误, 比如 {"username": ["this field is required."]}
        // 我们把它们格式化成一个字符串
        const errorData = err.response.data;
        let errorMessages = [];
        if (errorData.username) errorMessages.push(`用户名: ${errorData.username[0]}`);
        if (errorData.email) errorMessages.push(`邮箱: ${errorData.email[0]}`);
        if (errorData.password) errorMessages.push(`密码: ${errorData.password[0]}`);

        if (errorMessages.length > 0) {
          setError(errorMessages.join(' '));
        } else {
          setError('注册失败，请重试。');
        }
      } else {
        setError('注册失败，请重试。');
      }
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '400px', margin: 'auto' }}>
      <h1>注册新账号</h1>

      <form onSubmit={handleSubmit}>
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

        <div style={{ marginBottom: '1âm' }}>
          <label htmlFor="email">邮箱:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

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

        {/* (!!) 新增: 确认密码字段 (!!) */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="passwordConfirm">确认密码:</label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ padding: '10px 15px' }}>
          注册
        </button>
      </form>
    </main>
  );
}