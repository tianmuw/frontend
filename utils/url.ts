// frontend/utils/url.ts

export const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;

  // 1. 如果已经是 http 开头的绝对路径 (例如阿里云 OSS)，直接返回
  if (url.startsWith('http') || url.startsWith('https')) {
    return url;
  }

  // 2. 如果是相对路径 (例如 /media/...)，补全后端 API 地址
  // 这样前端就会去 http://localhost:8000/media/... 找图片
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // 移除 apiUrl 结尾的斜杠 (如果有时) 和 url 开头的斜杠，防止双斜杠
  const cleanApiUrl = apiUrl.replace(/\/$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;

  return `${cleanApiUrl}${cleanPath}`;
};