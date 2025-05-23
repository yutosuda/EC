'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/api/apiClient';

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    product: {
      _id: string;
      name: string;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: {
    postalCode: string;
    prefecture: string;
    city: string;
    address1: string;
    address2?: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // 注文データを取得
  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // クエリパラメータを構築
      let queryParams = `page=${currentPage}&limit=20`;
      if (statusFilter !== 'all') {
        queryParams += `&status=${statusFilter}`;
      }
      if (dateFilter !== 'all') {
        queryParams += `&dateFilter=${dateFilter}`;
      }
      
      const response = await apiClient.get<{ orders: Order[], totalPages: number }>(`/orders?${queryParams}`);
      setOrders(response.orders);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError('注文情報の取得に失敗しました');
      console.error('注文取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // ステータス変更処理
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      // 成功したら注文リストを更新
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus as Order['status'] } 
          : order
      ));
    } catch (err) {
      alert('注文ステータスの更新に失敗しました');
      console.error('ステータス更新エラー:', err);
    }
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

  // 金額のフォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
  };

  // 注文ステータスに応じたバッジスタイル
  const getStatusBadgeStyle = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 日本語のステータス表示
  const getStatusText = (status: Order['status']) => {
    const statusMap: Record<Order['status'], string> = {
      'pending': '新規受付',
      'processing': '準備中',
      'shipped': '発送済み',
      'delivered': '配達完了',
      'cancelled': 'キャンセル'
    };
    return statusMap[status] || status;
  };

  // 支払い状況の日本語表示
  const getPaymentStatusText = (status: Order['paymentStatus']) => {
    const statusMap: Record<Order['paymentStatus'], string> = {
      'pending': '未払い',
      'paid': '支払済み',
      'failed': '支払失敗'
    };
    return statusMap[status] || status;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">注文管理</h1>
        <div className="text-center py-12">
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">注文管理</h1>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              注文ステータス
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="all">全てのステータス</option>
              <option value="pending">新規受付</option>
              <option value="processing">準備中</option>
              <option value="shipped">発送済み</option>
              <option value="delivered">配達完了</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期間
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="all">全期間</option>
              <option value="today">今日</option>
              <option value="yesterday">昨日</option>
              <option value="thisWeek">今週</option>
              <option value="lastWeek">先週</option>
              <option value="thisMonth">今月</option>
              <option value="lastMonth">先月</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              フィルターをリセット
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 注文リスト */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注文ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客情報</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注文日時</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">合計金額</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支払状況</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  該当する注文がありません
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.user.lastName} {order.user.firstName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getPaymentStatusText(order.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {/*
                    <button
                      onClick={() => router.push(`/admin/orders/${order._id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      詳細
                    </button>
                    */}
                    <button
                      disabled
                      className="text-gray-400 cursor-not-allowed mr-3"
                    >
                      詳細（準備中）
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="pending">新規受付</option>
                      <option value="processing">準備中</option>
                      <option value="shipped">発送済み</option>
                      <option value="delivered">配達完了</option>
                      <option value="cancelled">キャンセル</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 border ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              前へ
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 border-t border-b ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              次へ
            </button>
          </nav>
        </div>
      )}
    </div>
  );
} 