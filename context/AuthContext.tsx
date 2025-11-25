// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // 我们需要一个库来解码 JWT
import { ApiUser } from '@/types'; // 导入我们定义过的 User 类型

// 定义 Context 中包含的数据
interface AuthContextType {
  isAuthenticated: boolean;
  user: ApiUser | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  accessToken: string | null;
  isLoading: boolean; // 新增状态 
}

// 创建 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// (!!) 我们需要先安装 jwt-decode
// 请在 VSCode 终端中运行: npm install jwt-decode
// (!!)

// 创建一个"提供者" (Provider) 组件
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 默认为 true

  // 检查 localStorage 来初始化状态
  useEffect(() => {
    const initAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setAccessToken(token);
            await fetchCurrentUser(token);
        }
        // 无论成功失败，或者没有 token，初始化都算结束了
        setIsLoading(false); 
    };

    initAuth();
  }, []);

  // (关键) 根据 token 去 API 获取当前用户信息
  const fetchCurrentUser = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // (!!) 注意：Djoser 的 "me" 接口
      const response = await axios.get(`${apiUrl}/api/v1/auth/users/me/`, {
        headers: {
          Authorization: `JWT ${token}`, // 使用 JWT 认证
        },
      });
      setUser(response.data as ApiUser);
    } catch (error) {
      console.error("无法获取用户信息, token 可能已过期", error);
      // 不要在这里直接 logout，否则网络波动会导致登出。
      // 只需清除状态即可
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setAccessToken(null);
      setUser(null);
    }
  };

  // 登录函数
  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setAccessToken(accessToken);
    fetchCurrentUser(accessToken); // 登录成功后，获取用户信息
  };

  // 注销函数
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setAccessToken(null);
    // (可选) 强制刷新页面以确保状态清除
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, accessToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 创建一个自定义"钩子" (Hook)，让其他组件能轻松使用
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
};