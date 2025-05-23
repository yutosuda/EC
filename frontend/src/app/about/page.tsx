import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '会社概要 | 建設資材ECサイト',
  description: '建設資材ECサイトの会社概要です。私たちの理念、事業内容、会社情報をご紹介いたします。',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">会社概要</h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 会社情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-6">会社情報</h2>
          
          <div className="space-y-4">
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">会社名</span>
              <span>建設資材株式会社</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">設立</span>
              <span>2020年4月</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">資本金</span>
              <span>1,000万円</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">代表者</span>
              <span>代表取締役 田中 太郎</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">従業員数</span>
              <span>25名</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">所在地</span>
              <span>
                〒100-0001<br />
                東京都千代田区千代田1-1-1<br />
                建設ビル5F
              </span>
            </div>
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">電話番号</span>
              <span>03-XXXX-XXXX</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">FAX</span>
              <span>03-XXXX-XXXX</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">メール</span>
              <span>info@construction-ec.com</span>
            </div>
          </div>
        </div>
        
        {/* 企業理念・事業内容 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">企業理念</h2>
            <p className="text-gray-700 leading-relaxed">
              私たちは、高品質な建設資材の提供を通じて、
              お客様の建設プロジェクトの成功に貢献することを使命としています。
              安全性、品質、環境配慮を最重要視し、
              持続可能な社会の発展に寄与してまいります。
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">事業内容</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• 建設資材のオンライン販売</li>
              <li>• 建設資材の調達・供給サービス</li>
              <li>• 建設プロジェクトのコンサルティング</li>
              <li>• 建設資材の品質管理・検査サービス</li>
              <li>• 環境配慮型建材の開発・販売</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 沿革 */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">沿革</h2>
        
        <div className="space-y-4">
          <div className="flex">
            <span className="font-medium w-24 text-gray-600">2020年4月</span>
            <span>建設資材株式会社設立</span>
          </div>
          <div className="flex">
            <span className="font-medium w-24 text-gray-600">2020年8月</span>
            <span>建設資材ECサイト開設</span>
          </div>
          <div className="flex">
            <span className="font-medium w-24 text-gray-600">2021年3月</span>
            <span>法人向けサービス開始</span>
          </div>
          <div className="flex">
            <span className="font-medium w-24 text-gray-600">2022年1月</span>
            <span>物流センター（千葉）開設</span>
          </div>
          <div className="flex">
            <span className="font-medium w-24 text-gray-600">2023年4月</span>
            <span>環境配慮型建材事業部設立</span>
          </div>
          <div className="flex">
            <span className="font-medium w-24 text-gray-600">2024年1月</span>
            <span>品質管理センター開設</span>
          </div>
        </div>
      </div>
      
      {/* アクセス */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">アクセス</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">最寄駅</h3>
            <ul className="text-gray-700 space-y-1">
              <li>• JR東京駅 徒歩5分</li>
              <li>• 地下鉄大手町駅 徒歩3分</li>
              <li>• 地下鉄二重橋前駅 徒歩7分</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">営業時間</h3>
            <div className="text-gray-700">
              <p>平日: 9:00 - 18:00</p>
              <p>土曜: 9:00 - 17:00</p>
              <p>日曜・祝日: 休業</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-gray-600">
            ※ お越しの際は事前にお電話でご連絡ください。<br />
            ※ 駐車場は限りがございますので、公共交通機関のご利用をお勧めいたします。
          </p>
        </div>
      </div>
    </div>
  );
} 