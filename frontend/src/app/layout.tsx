import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '建設資材ECサイト',
  description: '高品質な建設資材を豊富に取り揃えた専門ECサイトです。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <div className="flex-grow">
          {children}
        </div>
      </body>
    </html>
  );
} 