import React from 'react';
import { Metadata } from 'next';
import { ResetPasswordForm } from '@/frontend/components/Auth';

export const metadata: Metadata = {
  title: 'パスワード再設定 | 建設資材ECサイト',
  description: '新しいパスワードを設定して、アカウントへのアクセスを回復してください。',
};

export default function ResetPasswordPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-screen-md mx-auto">
        <ResetPasswordForm />
      </div>
    </main>
  );
} 