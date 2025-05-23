'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/contexts/cartStore';
import { useAuthStore } from '@/contexts/authStore';
import { apiClient } from '@/api/apiClient';

// 住所情報のインターフェース
interface ShippingAddress {
  postalCode: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
}

// 支払い方法の列挙
enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CONVENIENCE_STORE = 'convenience_store',
  CASH_ON_DELIVERY = 'cash_on_delivery'
}

function CheckoutPageContent() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  // フォーム状態
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    postalCode: '',
    prefecture: '',
    city: '',
    address1: '',
    address2: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);
  const [notes, setNotes] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedSpecialConditions, setAgreedSpecialConditions] = useState(false);
  
  // UI状態
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // 料金計算
  const subtotal = getTotalPrice();
  const taxRate = 0.1;
  const tax = Math.round(subtotal * taxRate);
  const shippingFee = subtotal >= 10000 ? 0 : 800;
  const total = subtotal + tax + shippingFee;
  
  // 価格フォーマッタ
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
  };

  // 認証チェック
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    
    // ユーザーのデフォルト住所を設定
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      if (defaultAddress) {
        setShippingAddress({
          postalCode: defaultAddress.postalCode,
          prefecture: defaultAddress.prefecture,
          city: defaultAddress.city,
          address1: defaultAddress.address1,
          address2: defaultAddress.address2 || ''
        });
      }
    }
  }, [isAuthenticated, items.length, user, router]);

  // 中古品チェック（将来の拡張用）
  const hasUsedProducts = items.some(item => false); // 現在は全て新品と仮定

  // 住所変更ハンドラ
  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 注文確認の表示
  const handleShowConfirmation = () => {
    setError(null);
    
    // バリデーション
    if (!shippingAddress.postalCode || !shippingAddress.prefecture || 
        !shippingAddress.city || !shippingAddress.address1) {
      setError('配送先住所をすべて入力してください。');
      return;
    }
    
    if (!agreedTerms) {
      setError('利用規約への同意が必要です。');
      return;
    }
    
    if (hasUsedProducts && !agreedSpecialConditions) {
      setError('中古品の購入には特別条件への同意が必要です。');
      return;
    }
    
    setShowConfirmation(true);
  };

  // 注文実行
  const handleSubmitOrder = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // 注文データの準備
      const orderData = {
        items: items.map(item => ({
          product: item.productId,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod,
        notes: notes.trim() || undefined,
        agreedTerms,
        agreedSpecialConditions: hasUsedProducts ? agreedSpecialConditions : undefined
      };
      
      // 注文API呼び出し（レスポンス型を明示的に定義）
      interface OrderResponse {
        message: string;
        order: {
          _id: string;
          orderNumber: string;
          [key: string]: any;
        };
      }
      
      const response = await apiClient.post<OrderResponse>('/orders', orderData);
      
      if (response && response.order) {
        // 注文成功 - カートをクリアして完了ページへ
        clearCart();
        router.push(`/checkout/complete?orderNumber=${response.order.orderNumber}`);
      } else {
        throw new Error('注文の作成に失敗しました。');
      }
      
    } catch (err: any) {
      console.error('注文エラー:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('注文の処理中にエラーが発生しました。しばらく時間を置いてから再度お試しください。');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 確認画面
  if (showConfirmation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">注文確認</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 注文内容 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">注文内容</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center space-x-4 border-b pb-4">
                  <div className="h-16 w-16 bg-gray-200 rounded">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-16 w-16 object-contain"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">画像なし</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">数量: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>小計 ({getTotalItems()}点)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>消費税</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>送料</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>合計</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
          
          {/* 配送・支払い情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">配送・支払い情報</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">配送先住所</h3>
                <div className="text-sm">
                  <p>〒{shippingAddress.postalCode}</p>
                  <p>{shippingAddress.prefecture}{shippingAddress.city}</p>
                  <p>{shippingAddress.address1}</p>
                  {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">支払い方法</h3>
                <p className="text-sm">
                  {paymentMethod === PaymentMethod.CREDIT_CARD && 'クレジットカード'}
                  {paymentMethod === PaymentMethod.BANK_TRANSFER && '銀行振込'}
                  {paymentMethod === PaymentMethod.CONVENIENCE_STORE && 'コンビニ決済'}
                  {paymentMethod === PaymentMethod.CASH_ON_DELIVERY && '代金引換'}
                </p>
              </div>
              
              {notes && (
                <div>
                  <h3 className="font-medium mb-2">備考</h3>
                  <p className="text-sm">{notes}</p>
                </div>
              )}
            </div>
            
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isProcessing}
              >
                戻る
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? '処理中...' : '注文を確定する'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // メインの注文フォーム
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">注文手続き</h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 左側: 入力フォーム */}
        <div className="space-y-6">
          {/* 配送先住所 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">配送先住所</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  郵便番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  placeholder="1000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  都道府県 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress.prefecture}
                  onChange={(e) => handleAddressChange('prefecture', e.target.value)}
                  placeholder="東京都"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                市区町村 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="千代田区"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                番地・建物名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingAddress.address1}
                onChange={(e) => handleAddressChange('address1', e.target.value)}
                placeholder="1-1-1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                建物名・部屋番号
              </label>
              <input
                type="text"
                value={shippingAddress.address2}
                onChange={(e) => handleAddressChange('address2', e.target.value)}
                placeholder="○○ビル 123号室"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* 支払い方法 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">支払い方法</h2>
            
            <div className="space-y-3">
              {Object.values(PaymentMethod).map((method) => (
                <label key={method} className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mr-3"
                  />
                  <span>
                    {method === PaymentMethod.CREDIT_CARD && 'クレジットカード'}
                    {method === PaymentMethod.BANK_TRANSFER && '銀行振込'}
                    {method === PaymentMethod.CONVENIENCE_STORE && 'コンビニ決済'}
                    {method === PaymentMethod.CASH_ON_DELIVERY && '代金引換'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* 備考 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">備考</h2>
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="配送時間のご希望やその他ご要望がございましたらご記入ください"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 同意事項 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">同意事項</h2>
            
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mr-3 mt-1"
                />
                <span className="text-sm">
                  <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                    利用規約
                  </a>
                  に同意します <span className="text-red-500">*</span>
                </span>
              </label>
              
              {hasUsedProducts && (
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreedSpecialConditions}
                    onChange={(e) => setAgreedSpecialConditions(e.target.checked)}
                    className="mr-3 mt-1"
                  />
                  <span className="text-sm">
                    中古品の購入条件に同意します <span className="text-red-500">*</span>
                  </span>
                </label>
              )}
            </div>
          </div>
        </div>
        
        {/* 右側: 注文サマリー */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">注文サマリー</h2>
          
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center space-x-3 text-sm">
                <div className="h-12 w-12 bg-gray-200 rounded">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="h-12 w-12 object-contain"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">画像</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium line-clamp-2">{item.name}</p>
                  <p className="text-gray-500">×{item.quantity}</p>
                </div>
                <div>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 border-t pt-4 mb-6">
            <div className="flex justify-between">
              <span>小計 ({getTotalItems()}点)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>消費税</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>送料</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
            {subtotal >= 10000 && (
              <p className="text-sm text-green-600">10,000円以上で送料無料</p>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>合計</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={handleShowConfirmation}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            注文内容を確認する
          </button>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>※ 商品の在庫状況により、ご注文をお受けできない場合があります。</p>
            <p>※ 送料は配送先により異なる場合があります。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
} 