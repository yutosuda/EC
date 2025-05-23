'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, RegisterData } from '@/frontend/contexts/authStore';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { register, isLoading, error, clearError } = useAuthStore(state => ({
    register: state.register,
    isLoading: state.isLoading,
    error: state.error,
    clearError: state.clearError
  }));

  // 入力フィールド変更時の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();
    
    // 入力検証
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.phoneNumber) {
      setFormError('すべてのフィールドを入力してください');
      return;
    }
    
    if (formData.password !== confirmPassword) {
      setFormError('パスワードと確認用パスワードが一致しません');
      return;
    }
    
    if (formData.password.length < 8) {
      setFormError('パスワードは8文字以上である必要があります');
      return;
    }
    
    try {
      // ユーザー登録処理
      await register(formData);
      
      // 成功したらホームページにリダイレクト
      router.push('/');
    } catch (error: any) {
      // エラーは既にstore内で処理されているため、ここでは何もしない
      console.error('Registration error:', error);
    }
  };

  // エラーメッセージ
  const errorMessage = formError || error;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">アカウント登録</h2>
      
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lastName" className="block text-gray-700 font-medium mb-1">
              姓
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="山田"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="firstName" className="block text-gray-700 font-medium mb-1">
              名
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="太郎"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="phoneNumber" className="block text-gray-700 font-medium mb-1">
            電話番号
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="090-1234-5678"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">8文字以上の英数字を含むパスワードを設定してください</p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
            パスワード（確認）
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? '登録中...' : 'アカウント登録'}
        </button>
        
        <div className="text-center mt-4">
          <span className="text-gray-600">すでにアカウントをお持ちですか？</span>{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            ログイン
          </Link>
        </div>
      </form>
    </div>
  );
}; 