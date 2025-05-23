'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/contexts/authStore';

function CheckoutCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const orderNumberParam = searchParams.get('orderNumber');
    if (!orderNumberParam) {
      router.push('/cart');
      return;
    }

    setOrderNumber(orderNumberParam);
  }, [isAuthenticated, searchParams, router]);

  if (!orderNumber) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* 成功アイコン */}
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* メインメッセージ */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ご注文ありがとうございます
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          ご注文を承りました。注文の詳細は以下の通りです。
        </p>

        {/* 注文情報カード */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">注文情報</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">注文番号</span>
              <span className="font-semibold text-lg">{orderNumber}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">注文日時</span>
              <span>{new Date().toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>
        </div>

        {/* 次のステップ */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            今後の流れ
          </h3>
          <div className="text-left space-y-2 text-blue-800">
            <p>• 注文確認メールをお送りいたします</p>
            <p>• ご入金確認後、商品の準備を開始いたします</p>
            <p>• 発送時に追跡番号をご連絡いたします</p>
            <p>• 配送状況はマイページからも確認できます</p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-4">
          <Link
            href="/account/orders"
            className="inline-block w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            注文履歴を確認する
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              お買い物を続ける
            </Link>
            
            <Link
              href="/"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
        </div>

        {/* お問い合わせ */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">ご不明な点がございましたら</h3>
          <p className="text-gray-600 mb-4">
            ご注文に関するお問い合わせは、以下までご連絡ください。
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>お問い合わせ先: <a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a></p>
            <p>電話: 03-XXXX-XXXX（平日 9:00〜18:00）</p>
            <p>メール: order@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    }>
      <CheckoutCompleteContent />
    </Suspense>
  );
} 