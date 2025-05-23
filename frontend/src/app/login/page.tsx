import React from 'react';
import { Metadata } from 'next';
import { LoginForm } from '@/components/Auth';

export const metadata: Metadata = {
  title: 'ログイン | 建設資材ECサイト',
  description: 'アカウントにログインして、建設資材の購入や注文履歴の確認ができます。',
};

export default function LoginPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-screen-md mx-auto">
        <LoginForm />
      </div>
    </main>
  );
} 