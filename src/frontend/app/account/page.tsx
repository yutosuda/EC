'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/frontend/contexts/authStore';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, getCurrentUser } = useAuthStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    getCurrentUser: state.getCurrentUser
  }));

  useEffect(() => {
    // ユーザー情報を取得
    getCurrentUser();
  }, [getCurrentUser]);

  // 認証状態の確認（Next.jsのミドルウェアでも保護しているが、クライアントサイドでも確認）
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">マイページ</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">アカウント情報</h2>
          
          {user && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">お名前</p>
                <p className="font-medium">{user.lastName} {user.firstName}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">メールアドレス</p>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">電話番号</p>
                <p className="font-medium">{user.phoneNumber}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">アカウントタイプ</p>
                <p className="font-medium">
                  {user.accountType === 'individual' ? '個人' : '法人'}
                  {user.companyName && ` (${user.companyName})`}
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Link 
              href="/account/edit-profile" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              プロフィール編集
            </Link>
            
            <Link 
              href="/account/change-password" 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              パスワード変更
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">住所情報</h2>
          
          {user && user.addresses && user.addresses.length > 0 ? (
            <div className="space-y-4">
              {user.addresses.map((address, index) => (
                <div key={index} className="border p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-gray-200 text-gray-800 mr-2">
                        {address.addressType === 'shipping' ? '配送先' : '請求先'}
                      </span>
                      {address.isDefault && (
                        <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                          デフォルト
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="mb-1">〒{address.postalCode}</p>
                  <p className="mb-1">{address.prefecture}{address.city}</p>
                  <p className="mb-1">{address.address1}</p>
                  {address.address2 && <p>{address.address2}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">登録されている住所がありません。</p>
          )}
          
          <div className="mt-4">
            <Link 
              href="/account/addresses" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              住所管理
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">最近の注文</h2>
          
          <p className="text-gray-600 mb-4">最近の注文履歴はこちらで確認できます。</p>
          
          <Link 
            href="/account/orders" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            注文履歴を見る
          </Link>
        </div>
      </div>
    </main>
  );
} 