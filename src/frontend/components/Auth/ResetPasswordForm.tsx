'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/frontend/api/apiClient';

export const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // トークンが存在しない場合のエラー
  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">パスワードのリセット</h2>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>無効なリセットリンクです。パスワードリセットリンクが期限切れか、不正なリンクの可能性があります。</p>
        </div>
        
        <div className="text-center mt-4">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            パスワードリセットを再度リクエスト
          </Link>
        </div>
      </div>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 入力検証
    if (!newPassword || !confirmPassword) {
      setError('すべてのフィールドを入力してください');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('パスワードと確認用パスワードが一致しません');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // パスワードリセット実行
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', {
        token,
        newPassword
      });
      
      if (response.success) {
        setSuccessMessage(response.message || 'パスワードがリセットされました');
      }
    } catch (error: any) {
      setError(error.message || 'パスワードリセット中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">新しいパスワードの設定</h2>
      
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
          <p className="mb-4">新しいパスワードでログインしてください。</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            ログインページへ
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-gray-600 mb-4">
            新しいパスワードを入力してください。
          </p>
          
          <div>
            <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-1">
              新しいパスワード
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">8文字以上の英数字を含むパスワードを設定してください</p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
              新しいパスワード（確認）
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
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
            {isSubmitting ? '処理中...' : 'パスワードを変更'}
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