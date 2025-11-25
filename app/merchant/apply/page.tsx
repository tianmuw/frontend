// app/merchant/apply/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface MerchantProfile {
  id: number;
  shop_name: string;
  status: 'pending' | 'approved' | 'rejected';
  reject_reason?: string;
}

export default function MerchantApplyPage() {
  // 获取 isLoading
  const { accessToken, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 状态
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [license, setLicense] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [merchantInfo, setMerchantInfo] = useState<MerchantProfile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. 检查当前状态
  useEffect(() => {
    // 1. 如果 Auth 还在加载，什么都不做，等待
    if (isLoading) return;

    // 2. Auth 加载完了，如果没登录，才跳转
    if (!isAuthenticated) {
        router.push('/login');
        return;
    }

    const checkStatus = async () => {
      if (!accessToken) return;
      try {
        const res = await axios.get(`${apiUrl}/api/v1/merchants/me/`, {
           headers: { Authorization: `JWT ${accessToken}` }
        });
        setMerchantInfo(res.data);
      } catch (err: any) {
        // 404 说明没申请过，正常情况
        if (err.response?.status !== 404) {
           console.error(err);
        }
      } finally {
        setPageLoading(false);
      }
    };

    checkStatus();
  }, [isLoading, accessToken, isAuthenticated, router, apiUrl]);


  // 2. 处理图片选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLicense(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 3. 提交申请
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!license) {
        setError('请上传营业执照');
        return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('shop_name', shopName);
      formData.append('description', description);
      formData.append('license_image', license);

      const res = await axios.post(`${apiUrl}/api/v1/merchants/`, formData, {
        headers: { Authorization: `JWT ${accessToken}` }
      });
      
      setMerchantInfo(res.data); // 更新状态为已提交

    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.shop_name) {
          setError(`提交失败: ${err.response.data.shop_name[0]}`);
      } else {
          setError('提交失败，请重试。');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || (isAuthenticated && pageLoading)) {
    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
  }

  // --- 状态视图：已申请 ---
  if (merchantInfo) {
      return (
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow border border-gray-200 text-center">
            {merchantInfo.status === 'pending' && (
                <>
                    <div className="text-6xl mb-4">⏳</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">申请审核中</h1>
                    <p className="text-gray-600">您的店铺 <strong>{merchantInfo.shop_name}</strong> 正在审核中，请耐心等待。</p>
                </>
            )}
            
            {merchantInfo.status === 'approved' && (
                <>
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-2xl font-bold text-green-600 mb-2">恭喜！审核通过</h1>
                    <p className="text-gray-600 mb-6">您现在是认证商家了。</p>
                    <Link href="/merchant/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700">
                        进入商家后台
                    </Link>
                </>
            )}

            {merchantInfo.status === 'rejected' && (
                <>
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-red-600 mb-2">申请被拒绝</h1>
                    <p className="text-gray-600 mb-4">拒绝理由：{merchantInfo.reject_reason || '未提供'}</p>
                    <p className="text-sm text-gray-500">请联系管理员或尝试重新申请（需后端支持重新提交）。</p>
                </>
            )}
        </div>
      );
  }

  // --- 表单视图：未申请 ---
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 mt-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">商家入驻申请</h1>
      <p className="text-gray-500 mb-8 text-sm">提交资料，开启您的开店之旅。</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 店铺名称 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">店铺名称</label>
          <input 
            type="text" 
            value={shopName} 
            onChange={e => setShopName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="给您的店铺起个名字"
            required
          />
        </div>

        {/* 简介 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">店铺简介</label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="主营什么商品？"
          />
        </div>

        {/* 营业执照上传 */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">上传营业执照 (图片)</label>
            <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="License Preview" className="max-h-64 mx-auto object-contain" />
                ) : (
                    <div className="text-gray-500">
                        <span className="text-4xl block mb-2">📄</span>
                        点击上传图片
                    </div>
                )}
                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                />
            </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}

        <div className="flex justify-end pt-4">
            <button 
                type="submit" 
                disabled={submitting}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? '提交中...' : '提交申请'}
            </button>
        </div>
      </form>
    </div>
  );
}