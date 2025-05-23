'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/contexts/authStore';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { login, isLoading, error, clearError } = useAuthStore(state => ({
    login: state.login,
    isLoading: state.isLoading,
    error: state.error,
    clearError: state.clearError
  }));

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // 入力検証
    if (!email || !password) {
      setFormError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    try {
      // ログイン処理
      await login(email, password);
      
      // 成功したらホームページにリダイレクト
      router.push('/');
    } catch (error: any) {
      // エラーは既にstore内で処理されているため、ここでは何もしない
      console.error('Login error:', error);
    }
  };

  // エラーメッセージ
  const errorMessage = formError || error;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">ログイン</h2>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => {
              setFormError('');
              clearError();
            }}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
        
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            パスワードをお忘れですか？
          </Link>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
        
        <div className="text-center mt-4">
          <span className="text-gray-600">アカウントをお持ちでないですか？</span>{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            新規登録
          </Link>
        </div>
      </form>
    </div>
  );
}; 