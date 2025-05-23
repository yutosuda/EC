'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore } from '@/frontend/contexts/cartStore';
import { useAuthStore } from '@/frontend/contexts/authStore';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const cartItemCount = getTotalItems();
  
  const { user, isAuthenticated, logout, getCurrentUser } = useAuthStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    logout: state.logout,
    getCurrentUser: state.getCurrentUser
  }));

  // ページロード時に認証情報を取得
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  const isActive = (path: string) => {
    return pathname === path ? 'border-b-2 border-white' : '';
  };
  
  // ログアウト処理
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-blue-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          建設資材ECサイト
        </Link>
        
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link 
                href="/" 
                className={`hover:underline ${isActive('/')}`}
              >
                ホーム
              </Link>
            </li>
            <li>
              <Link 
                href="/products" 
                className={`hover:underline ${isActive('/products')}`}
              >
                商品一覧
              </Link>
            </li>
            <li>
              <Link 
                href="/categories" 
                className={`hover:underline ${isActive('/categories')}`}
              >
                カテゴリ
              </Link>
            </li>
            <li>
              <Link 
                href="/cart" 
                className={`relative flex items-center hover:underline ${isActive('/cart')}`}
              >
                <span className="mr-1">カート</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </li>
            
            {isAuthenticated ? (
              <>
                <li className="relative group">
                  <button className="flex items-center hover:underline focus:outline-none">
                    <span className="mr-1">{user?.firstName || 'ユーザー'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link href="/account" className="block px-4 py-2 hover:bg-gray-100">
                      マイページ
                    </Link>
                    <Link href="/account/orders" className="block px-4 py-2 hover:bg-gray-100">
                      注文履歴
                    </Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100">
                        管理画面
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      ログアウト
                    </button>
                  </div>
                </li>
              </>
            ) : (
              <li>
                <Link 
                  href="/login" 
                  className={`hover:underline ${isActive('/login')}`}
                >
                  ログイン
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}; 