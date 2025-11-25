// app/merchant/products/new/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ApiTopic } from '@/types';

export default function NewProductPage() {
  const { accessToken, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // 表单状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. 加载话题 (因为商品本质上也是一个帖子，需要归属到一个话题)
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/v1/topics/`);
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setTopics(data);
        if (data.length > 0) setSelectedTopic(data[0].slug);
      } catch (err) { console.error(err); }
    };
    fetchTopics();
  }, [apiUrl]);

  // 2. 处理图片选择
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 3. 提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!images.length) {
        setError("请至少上传一张商品图片");
        return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('topic', selectedTopic);
      formData.append('price', price); // (!!!) 发送价格
      formData.append('stock', stock); // (!!!) 发送库存
      
      images.forEach((image) => {
        formData.append('uploaded_images', image);
      });

      await axios.post(`${apiUrl}/api/v1/posts/`, formData, { 
        headers: { Authorization: `JWT ${accessToken}` } 
      });

      // 成功后跳转回商家后台
      router.push('/merchant/dashboard');
    } catch (err) {
      console.error(err);
      setError('发布失败，请检查网络。');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return <div className="p-20 text-center text-gray-500">请先登录...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 mt-6 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
        发布自营商品
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 商品名称 (标题) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">商品名称</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
            placeholder="例如：2025新款纯棉T恤"
          />
        </div>

        {/* 价格与库存 */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">销售价格 (¥)</label>
                <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0.00"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">库存数量</label>
                <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="100"
                />
            </div>
        </div>

        {/* 商品描述 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">商品详情描述</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
            placeholder="详细介绍一下你的商品..."
          />
        </div>

        {/* 所属话题 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">发布到哪个社区？</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {topics.length === 0 ? <option disabled>加载中...</option> : topics.map(t => <option key={t.slug} value={t.slug}>t/{t.name}</option>)}
          </select>
        </div>

        {/* 图片上传 */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">商品图片 (第一张将作为主图)</label>
            <div className="flex gap-4 mb-4">
                <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-bold transition-colors"
                >
                    <span>📷</span> 上传图片
                </button>
                <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
            </div>

            {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                    {imagePreviews.map((src, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={src} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100">&times;</button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}

        <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? '发布中...' : '立即上架'}
            </button>
        </div>
      </form>
    </div>
  );
}