import React from 'react';
import Link from 'next/link';

// ホームページ
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">建設資材ECサイトへようこそ</h1>
        <p className="text-xl mb-8">
          高品質な建設資材を豊富に取り揃えております。会員登録して様々な特典をご利用ください。
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {/* 特集カード */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">新商品</h2>
            <p className="mb-4">最新の建設資材をご紹介します。常に最新の製品を取り揃えています。</p>
            <Link href="/products" className="text-blue-600 hover:underline">
              商品を見る &rarr;
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">特価セール</h2>
            <p className="mb-4">期間限定の特別価格でご提供中の商品です。お見逃しなく！</p>
            <Link href="/products/sale" className="text-blue-600 hover:underline">
              セール商品を見る &rarr;
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">法人のお客様</h2>
            <p className="mb-4">法人会員様向けの特別サービスをご用意しています。</p>
            <Link href="/business" className="text-blue-600 hover:underline">
              詳細を見る &rarr;
            </Link>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">人気カテゴリ</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {['鉄骨材', 'コンクリート資材', '木材', '工具・機械'].map((category) => (
              <div key={category} className="bg-gray-100 rounded-lg p-4">
                <Link href={`/categories/${category}`} className="block hover:text-blue-600">
                  {category}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 