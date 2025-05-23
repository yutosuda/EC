import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/Auth';

export const metadata: Metadata = {
  title: 'パスワード再設定 | 建設資材ECサイト',
  description: '新しいパスワードを設定して、アカウントへのアクセスを回復してください。',
};

// Loading fallback component
function ResetPasswordLoading() {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">パスワード再設定</h2>
      <div className="text-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-screen-md mx-auto">
        <Suspense fallback={<ResetPasswordLoading />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
} 