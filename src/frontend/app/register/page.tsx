import React from 'react';
import { Metadata } from 'next';
import { RegisterForm } from '@/frontend/components/Auth';

export const metadata: Metadata = {
  title: 'アカウント登録 | 建設資材ECサイト',
  description: '新規アカウントを作成して、建設資材ECサイトのサービスをご利用いただけます。',
};

export default function RegisterPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-screen-md mx-auto">
        <RegisterForm />
      </div>
    </main>
  );
} 