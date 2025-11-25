// app/merchant/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiPost } from '@/types';
import Link from 'next/link';

export default function MerchantDashboard() {
    const { accessToken, isAuthenticated, user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [products, setProducts] = useState<ApiPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalSales: 0, totalViews: 0 });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // 1. 再次确认商家状态
                const merchantRes = await axios.get(`${apiUrl}/api/v1/merchants/me/`, {
                    headers: { Authorization: `JWT ${accessToken}` }
                });

                if (merchantRes.data.status !== 'approved') {
                    router.push('/merchant/apply');
                    return;
                }

                // 2. 获取"我"发布的商品 -> 增加筛选条件: 只看 INTERNAL 
                const postsRes = await axios.get(
                    `${apiUrl}/api/v1/posts/?author__username=${user?.username}&product__product_type=INTERNAL`,
                    { headers: { Authorization: `JWT ${accessToken}` } }
                );

                // 兼容分页或列表返回
                const data = Array.isArray(postsRes.data) ? postsRes.data : postsRes.data.results || [];
                setProducts(data);

                // 简单统计浏览量
                const views = data.reduce((acc: number, curr: ApiPost) => acc + curr.view_count, 0);
                setStats({ totalSales: 0, totalViews: views });

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authLoading, isAuthenticated, accessToken, router, user, apiUrl]);

    if (authLoading || loading) return <div className="p-20 text-center text-gray-500">加载商家数据...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-10">

            {/* 顶部栏 */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">商家控制台</h1>
                    <p className="text-gray-500 text-sm mt-1">欢迎回来，{user?.username}</p>
                </div>
                <Link
                    href="/merchant/products/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                >
                    <span className="text-xl">+</span> 发布新商品
                </Link>
            </div>

            {/* 数据概览 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">总浏览量</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalViews}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">商品数量</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{products.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">总收益 (预估)</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">¥0.00</p>
                </div>
            </div>

            {/* 商品列表 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-gray-700">在售商品列表</h3>
                </div>

                {products.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="text-4xl mb-4">📦</div>
                        <h3 className="text-lg font-medium text-gray-900">暂无商品</h3>
                        <p className="text-gray-500 mt-2 mb-6">您还没有发布任何商品，快去上架吧！</p>
                        <Link href="/merchant/products/new" className="text-blue-600 hover:underline">
                            立即发布 &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">商品信息</th>
                                    <th className="px-6 py-3">自营价格</th>
                                    <th className="px-6 py-3">库存</th>
                                    <th className="px-6 py-3">状态</th>
                                    <th className="px-6 py-3 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                                    {item.product?.product_image_url ? (
                                                        <img src={item.product.product_image_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">无图</div>
                                                    )}
                                                </div>
                                                <Link href={`/posts/${item.id}`} className="font-medium text-gray-900 hover:text-blue-600 hover:underline line-clamp-2 max-w-xs">
                                                    {item.title}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-orange-600">
                                            {/* 优先显示自营价格，否则显示爬虫价格 */}
                                            {item.product?.price ? `¥${item.product.price}` : (item.product?.product_price || '-')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.product?.stock !== undefined ? item.product.stock : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">销售中</span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium">编辑</button>
                                            <button className="text-red-600 hover:text-red-800 font-medium">下架</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}