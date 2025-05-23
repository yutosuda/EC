import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 mt-12">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">会社情報</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:underline">
                  会社概要
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:underline">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">カスタマーサポート</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="hover:underline">
                  よくある質問
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:underline">
                  配送について
                </Link>
              </li>
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
          <p>&copy; {new Date().getFullYear()} 建設資材ECサイト All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}; 