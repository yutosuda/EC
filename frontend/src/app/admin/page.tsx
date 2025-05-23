'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/api/apiClient';

interface DashboardStats {
  totalOrders: number;
  newOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: {
    _id: string;
    orderNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
  topProducts: {
    _id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ stats: DashboardStats }>('/admin/dashboard');
        setStats(response.stats);
      } catch (err: any) {
        setError('ダッシュボード情報の取得に失敗しました');
        console.error('ダッシュボード取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // 金額のフォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
  };

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
        <div className="text-center py-12">
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'データの取得に失敗しました'}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">総注文数</p>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
              すべての注文を見る &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">総売上</p>
              <p className="text-2xl font-semibold">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              新規注文: {stats.newOrders}件
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">商品数</p>
              <p className="text-2xl font-semibold">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">
              商品管理へ &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">会員数</p>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            {/*
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
              ユーザー管理へ &rarr;
            </Link>
            */}
            <span className="text-sm text-gray-400">
              ユーザー管理（準備中）
            </span>
          </div>
        </div>
      </div>

      {/* 注意喚起 */}
      {stats.lowStockProducts > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <strong>在庫僅少の商品があります。</strong> {stats.lowStockProducts}件の商品が在庫不足しています。
              </p>
              <div className="mt-2">
                <Link
                  href="/admin/products?filter=lowStock"
                  className="text-yellow-700 underline text-sm"
                >
                  対象商品を確認する
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近の注文 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">最近の注文</h2>
          </div>
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注文番号</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                      {/*
                      <Link href={`/admin/orders/${order._id}`}>{order.orderNumber}</Link>
                      */}
                      <span className="text-gray-600">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {order.user.lastName} {order.user.firstName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 text-right">
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
              すべての注文を見る &rarr;
            </Link>
          </div>
        </div>

        {/* 人気商品 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">人気商品</h2>
          </div>
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">販売数</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">売上</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.topProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                      {/*
                      <Link href={`/admin/products/${product._id}`}>{product.name}</Link>
                      */}
                      <span className="text-gray-600">{product.name}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product.totalSold}個
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 text-right">
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">
              すべての商品を見る &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 