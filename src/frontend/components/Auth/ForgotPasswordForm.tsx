'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/frontend/api/apiClient';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力検証
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // パスワードリセットリクエスト送信
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password-request', { email });
      
      if (response.success) {
        setSuccessMessage(response.message || 'パスワードリセット用のメールを送信しました。メールの指示に従ってください。');
        setEmail('');
      }
    } catch (error: any) {
      setError(error.message || 'リクエスト処理中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">パスワードをお忘れですか？</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError('')}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}
      
      {successMessage ? (
        <div className="text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>{successMessage}</p>
          </div>
          <p className="mb-4">メールが届かない場合は、迷惑メールフォルダをご確認いただくか、別のメールアドレスで再度お試しください。</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            ログインページに戻る
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-gray-600 mb-4">
            アカウントに登録されているメールアドレスを入力してください。パスワードリセットのためのリンクをメールでお送りします。
          </p>
          
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
              disabled={isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '送信中...' : 'リセットリンクを送信'}
          </button>
          
          <div className="text-center mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">
              ログインページに戻る
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}; 