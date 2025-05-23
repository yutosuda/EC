'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiClient } from '@/api/apiClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 管理者権限チェック
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/auth/me') as { user: { role: string } };
        
        if (response.user && (response.user.role === 'admin' || response.user.role === 'superadmin')) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          // 管理者でない場合はリダイレクト
          router.push('/login');
        }
      } catch (err) {
        console.error('認証エラー:', err);
        setIsAdmin(false);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  // 現在のパスがアクティブかどうかをチェック
  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') {
      return true;
    }
    if (path !== '/admin' && pathname?.startsWith(path)) {
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">認証中...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return null; // リダイレクト中なので何も表示しない
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* モバイルサイドバートグル */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-md shadow"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>
      
      {/* サイドバー */}
      <div className={`fixed inset-y-0 left-0 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 ease-in-out md:relative z-40 md:z-auto w-64 bg-white shadow-lg`}>
        {/* ロゴ部分 */}
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold text-gray-800">管理画面</h1>
        </div>
        
        {/* ナビゲーションリンク */}
        <nav className="mt-6">
          <div className="px-4 py-2 text-xs text-gray-600 uppercase">メインメニュー</div>
          
          <Link href="/admin" 
            className={`flex items-center px-6 py-3 ${
              isActive('/admin') && pathname === '/admin' 
                ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>ダッシュボード</span>
          </Link>
          
          <Link href="/admin/products" 
            className={`flex items-center px-6 py-3 ${
              isActive('/admin/products') 
                ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
            <span>商品管理</span>
          </Link>
          
          <Link href="/admin/categories" 
            className={`flex items-center px-6 py-3 ${
              isActive('/admin/categories') 
                ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>カテゴリ管理</span>
          </Link>
          
          <Link href="/admin/orders" 
            className={`flex items-center px-6 py-3 ${
              isActive('/admin/orders') 
                ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>注文管理</span>
          </Link>
          
          <Link href="/admin/users" 
            className={`flex items-center px-6 py-3 ${
              isActive('/admin/users') 
                ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>ユーザー管理</span>
          </Link>
          
          <div className="px-4 py-2 mt-4 text-xs text-gray-600 uppercase">その他</div>
          
          <Link href="/admin/coupons" 
            className={`flex items-center px-6 py-3 ${
              isActive('/admin/coupons') 
                ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span>クーポン管理</span>
          </Link>
          
          <Link href="/admin/settings" 
            className={`flex items-center px-6 py-3 ${
              isActive('/admin/settings') 
                ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>設定</span>
          </Link>
          
          <div className="border-t border-gray-200 mt-6 pt-4">
            <Link href="/" 
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>サイトに戻る</span>
            </Link>
          </div>
        </nav>
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="bg-white shadow">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">建設資材ECサイト 管理画面</h2>
            </div>
            <div>
              <button
                onClick={() => {
                  // ログアウト処理
                  apiClient.clearToken();
                  router.push('/login');
                }}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
              >
                ログアウト
              </button>
            </div>
          </div>
        </header>
        
        {/* メインコンテンツエリア */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
      
      {/* モバイルサイドバーオーバーレイ */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
} 