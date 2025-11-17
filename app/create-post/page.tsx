// app/create-post/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// 1. 导入 useAuth 来获取登录状态和 token
import { useAuth } from '@/context/AuthContext';

// 2. 导入我们的话题类型
import { ApiTopic } from '@/types';

export default function CreatePostPage() {
  const { user, accessToken, isAuthenticated } = useAuth();
  const router = useRouter();

  // 3. 表单的状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(''); // 存储选中的 topic slug
  const [error, setError] = useState<string | null>(null);

  // 4. (新) 存储从 API 获取的话题列表
  const [topics, setTopics] = useState<ApiTopic[]>([]);

  // 5. (新) 效果钩子：在组件加载时获取话题列表
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/api/v1/topics/`);
        setTopics(response.data);
        // 默认选中第一个话题
        if (response.data.length > 0) {
          setSelectedTopic(response.data[0].slug);
        }
      } catch (err) {
        console.error('无法加载话题', err);
        setError('无法加载话题列表，请刷新重试。');
      }
    };

    fetchTopics();
  }, []); // 空依赖数组，表示只在组件加载时运行一次

  // 6. (关键) 路由保护
  useEffect(() => {
    // 如果 AuthContext 确认加载完毕，但用户未认证
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // 7. 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accessToken) {
      setError('您未登录或登录已过期，请重新登录。');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // 8. (关键) 发送 POST 请求，并带上认证 Header
      await axios.post(
        `${apiUrl}/api/v1/posts/`,
        {
          title: title,
          content: content,
          product_url: productUrl,
          topic: selectedTopic, // 后端需要的是 topic slug
        },
        {
          headers: {
            // (!!!) 这就是我们用 JWT 令牌认证的方式 (!!!)
            Authorization: `JWT ${accessToken}`,
          },
        }
      );

      // 9. 发布成功！跳转回首页
      router.push('/');

    } catch (err) {
      console.error('发布失败', err);
      setError('发布失败，请检查所有字段并重试。');
    }
  };

  // 10. 如果未登录，显示加载中... (防止页面闪烁)
  if (!isAuthenticated) {
    return <main style={{ padding: '2rem' }}>加载中...</main>;
  }

  // 11. (新) 话题下拉菜单
  const topicSelector = (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="topic">选择话题:</label>
      <select
        id="topic"
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.target.value)}
        required
        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
      >
        {topics.length === 0 ? (
          <option disabled>加载话题中...</option>
        ) : (
          topics.map((topic) => (
            <option key={topic.slug} value={topic.slug}>
              {topic.name}
            </option>
          ))
        )}
      </select>
    </div>
  );

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h1>发布新帖子</h1>
      <form onSubmit={handleSubmit}>
        {/* 话题下拉菜单 */}
        {topicSelector}

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="title">标题:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="content">内容:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="productUrl">关联商品链接 (URL):</label>
          <input
            id="productUrl"
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            required
            placeholder="例如: https://www.jd.com/..."
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ padding: '10px 15px' }}>
          发布
        </button>
      </form>
    </main>
  );
}