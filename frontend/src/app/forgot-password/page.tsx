import React from 'react';
import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/Auth';

export const metadata: Metadata = {
  title: 'パスワード再設定 | 建設資材ECサイト',
  description: 'パスワードを忘れた場合は、こちらからパスワードリセット手続きを行ってください。',
};

export default function ForgotPasswordPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-screen-md mx-auto">
        <ForgotPasswordForm />
      </div>
    </main>
  );
} 