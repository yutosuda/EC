'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/frontend/contexts/cartStore';

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalItems, 
    getTotalPrice 
  } = useCartStore();

  // 価格表示用のフォーマッタ
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
  };

  // 数量変更ハンドラ
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  // 商品削除ハンドラ
  const handleRemoveItem = (productId: string) => {
    if (confirm('この商品をカートから削除しますか？')) {
      removeItem(productId);
    }
  };

  // カートクリアハンドラ
  const handleClearCart = () => {
    if (confirm('カートを空にしますか？')) {
      clearCart();
    }
  };

  // 注文手続きへ進むハンドラ
  const handleProceedToCheckout = () => {
    // TODO: 認証状態をチェックし、未ログインの場合はログインページへリダイレクト
    router.push('/checkout');
  };

  // カートが空の場合
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ショッピングカート</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-lg mb-4">カートに商品がありません</p>
          <Link 
            href="/products" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            商品一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">ショッピングカート</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* カート商品リスト */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    価格
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    数量
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    小計
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.productId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 mr-4">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="h-16 w-16 object-contain"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">画像なし</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Link 
                            href={`/products/${item.productId}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                          >
                            {item.name}
                          </Link>
                          <div className="text-xs text-gray-500">
                            商品コード: {item.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatPrice(item.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="border border-gray-300 rounded-l px-2 py-1 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                          className="border-t border-b border-gray-300 text-center w-12 py-1 focus:outline-none"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="border border-gray-300 rounded-r px-2 py-1 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-between">
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-800"
            >
              ← 買い物を続ける
            </Link>
            
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800"
            >
              カートを空にする
            </button>
          </div>
        </div>
        
        {/* 注文サマリー */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">注文サマリー</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">小計 ({getTotalItems()}点)</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">送料</span>
                <span>別途計算</span>
              </div>
              <div className="border-t pt-3 font-semibold flex justify-between">
                <span>合計(税込)</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>
            
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              注文手続きへ進む
            </button>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>※ 送料は配送先住所により異なります。注文手続き画面で確認できます。</p>
              <p>※ 大型商品や特殊な配送が必要な商品は別途配送料が発生する場合があります。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 