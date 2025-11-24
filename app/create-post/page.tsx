// app/create-post/page.tsx (Tailwind 美化版)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ApiTopic } from '@/types';

export default function CreatePostPage() {
  const { accessToken, isAuthenticated } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // 多媒体状态
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  
  // 预览 URL (用于在界面上显示缩略图)
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 隐藏的文件输入框引用
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/api/v1/topics/`);
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopic(data[0].slug);
        }
      } catch (err) {
        console.error('无法加载话题', err);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // 处理图片选择
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]); // 追加模式

      // 生成预览图
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // 处理视频选择
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // 移除某张图片
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 移除视频
  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // 构建 FormData
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('topic', selectedTopic);
      if (productUrl) formData.append('product_url', productUrl);
      
      // 添加视频
      if (video) {
        formData.append('video', video);
      }

      // 添加多张图片 (注意：Django 后端是用 'uploaded_images' 接收列表)
      images.forEach((image) => {
        formData.append('uploaded_images', image);
      });

      await axios.post(
        `${apiUrl}/api/v1/posts/`, formData,
        { headers: { Authorization: `JWT ${accessToken}` } }
      );
      router.push('/');
    } catch (err) {
      console.error('发布失败', err);
      setError('发布失败，请检查所有字段并重试。');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return <div className="p-10 text-center text-gray-500">请先登录...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 mt-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
        发布新帖子
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 话题选择 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">选择话题 (Community)</label>
          <div className="relative">
             <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                required
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
            >
                {topics.length === 0 ? (
                <option disabled>加载中...</option>
                ) : (
                topics.map((topic) => (
                    <option key={topic.slug} value={topic.slug}>
                    t/{topic.name}
                    </option>
                ))
                )}
            </select>
          </div>
        </div>

        {/* 标题 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="起一个有趣的标题..."
          />
        </div>

        {/* (!!!) 多媒体上传区域 (!!!) */}
        <div className="flex gap-4">
            {/* 上传图片按钮 */}
            <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 text-sm font-bold transition-colors"
            >
                <span>🖼️</span> 添加图片
            </button>
            <input 
                ref={imageInputRef} 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={handleImageChange} 
            />

            {/* 上传视频按钮 */}
            <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 text-sm font-bold transition-colors"
            >
                <span>🎥</span> 添加视频
            </button>
            <input 
                ref={videoInputRef} 
                type="file" 
                accept="video/*" 
                className="hidden" 
                onChange={handleVideoChange} 
            />
        </div>

        {/* 图片预览区 */}
        {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
                {imagePreviews.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={src} className="w-full h-full object-cover" alt="preview" />
                        <button 
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        )}

        {/* 视频预览区 */}
        {videoPreview && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black">
                <video src={videoPreview} controls className="w-full max-h-96" />
                <button 
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-white/80 text-black rounded-full px-2 py-1 text-xs font-bold hover:bg-white"
                >
                    移除视频
                </button>
            </div>
        )}

        {/* 内容 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y placeholder-gray-400"
            placeholder="分享你的心得、评测或故事..."
          />
        </div>

        {/* 商品链接 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">关联商品链接 (URL)</label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              🔗
            </span>
            <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                required
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="例如: https://item.jd.com/..."
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">我们会自动抓取商品信息。</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">{error}</div>}

        <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '发布中...' : '发布'}
            </button>
        </div>
      </form>
    </div>
  );
}