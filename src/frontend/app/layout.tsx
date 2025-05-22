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
      <body className={inter.className}>
        <header className="bg-blue-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">建設資材ECサイト</h1>
            <nav>
              <ul className="flex space-x-4">
                <li><a href="/" className="hover:underline">ホーム</a></li>
                <li><a href="/products" className="hover:underline">商品一覧</a></li>
                <li><a href="/categories" className="hover:underline">カテゴリ</a></li>
                <li><a href="/cart" className="hover:underline">カート</a></li>
                <li><a href="/login" className="hover:underline">ログイン</a></li>
              </ul>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-800 text-white p-6 mt-12">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">会社情報</h3>
                <ul className="space-y-2">
                  <li><a href="/about" className="hover:underline">会社概要</a></li>
                  <li><a href="/terms" className="hover:underline">利用規約</a></li>
                  <li><a href="/privacy" className="hover:underline">プライバシーポリシー</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">カスタマーサポート</h3>
                <ul className="space-y-2">
                  <li><a href="/faq" className="hover:underline">よくある質問</a></li>
                  <li><a href="/contact" className="hover:underline">お問い合わせ</a></li>
                  <li><a href="/shipping" className="hover:underline">配送について</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">お問い合わせ</h3>
                <p>電話: 03-XXXX-XXXX</p>
                <p>メール: info@example.com</p>
                <p>受付時間: 平日 9:00〜18:00</p>
              </div>
            </div>
            <div className="border-t border-gray-600 mt-8 pt-4 text-center">
              <p>&copy; 2023 建設資材ECサイト All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
} 