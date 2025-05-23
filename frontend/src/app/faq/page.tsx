'use client';

import React, { useState } from 'react';
import { Metadata } from 'next';

// FAQアイテムの型定義
interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    category: '注文・購入',
    question: '注文はどのように行えばいいですか？',
    answer: 'お客様には、まず会員登録をしていただき、商品をカートに入れて注文手続きを進めてください。お支払い方法はクレジットカード、銀行振込、代金引換、コンビニ決済をご利用いただけます。'
  },
  {
    id: 2,
    category: '注文・購入',
    question: '最低注文金額はありますか？',
    answer: '特に最低注文金額の設定はございませんが、送料無料となる金額は税込10,000円以上です。10,000円未満の場合は、一律800円の送料をいただいております。'
  },
  {
    id: 3,
    category: '注文・購入',
    question: 'キャンセルは可能ですか？',
    answer: '商品の発送前でしたら、マイページの注文履歴または お電話・メールにてキャンセルを承ります。発送後のキャンセルはお受けできませんので、ご了承ください。'
  },
  {
    id: 4,
    category: '配送・納期',
    question: '配送にはどのくらいの時間がかかりますか？',
    answer: 'ご注文確定後、通常2-3営業日以内に発送いたします。配送地域により到着まで1-3日程度お時間をいただきます。大型商品や特注品の場合は、別途納期をご案内いたします。'
  },
  {
    id: 5,
    category: '配送・納期',
    question: '配送先を変更したいのですが？',
    answer: '商品発送前でしたら配送先の変更が可能です。マイページから変更していただくか、お急ぎの場合はお電話にてご連絡ください。発送後の変更はできかねます。'
  },
  {
    id: 6,
    category: '配送・納期',
    question: '時間指定配送は可能ですか？',
    answer: '午前中（9-12時）、午後（14-16時、16-18時、18-20時、19-21時）での時間指定が可能です。ただし、大型商品については時間指定ができない場合がございます。'
  },
  {
    id: 7,
    category: '支払い・決済',
    question: '支払い方法を教えてください。',
    answer: 'クレジットカード（VISA、MasterCard、JCB、AMEX、Diners）、銀行振込、代金引換、コンビニ決済をご利用いただけます。法人のお客様は請求書払いも対応いたします。'
  },
  {
    id: 8,
    category: '支払い・決済',
    question: '領収書は発行してもらえますか？',
    answer: 'はい、発行いたします。マイページの注文履歴から領収書をダウンロードしていただくか、別途郵送での発行も承ります。宛名や但し書きの指定も可能です。'
  },
  {
    id: 9,
    category: '商品・在庫',
    question: '商品の在庫状況を確認したいのですが？',
    answer: '各商品ページに在庫状況を表示しております。「在庫あり」「残り○個」「お取り寄せ」「在庫切れ」の表示をご確認ください。在庫に関するお問い合わせもお受けしております。'
  },
  {
    id: 10,
    category: '商品・在庫',
    question: '商品のサンプルを見ることはできますか？',
    answer: '一部の商品については、有料でサンプルをお送りしております。詳細は各商品ページをご確認いただくか、お問い合わせフォームよりご相談ください。'
  },
  {
    id: 11,
    category: '商品・在庫',
    question: '技術的な質問や施工方法について相談できますか？',
    answer: 'はい、経験豊富な技術スタッフが対応いたします。お電話またはお問い合わせフォームより、詳細をお聞かせください。必要に応じて現地調査も承ります。'
  },
  {
    id: 12,
    category: '返品・交換',
    question: '返品・交換は可能ですか？',
    answer: '商品に不具合がある場合や、ご注文と異なる商品が届いた場合は、商品到着後7日以内にご連絡ください。お客様都合による返品は、未開封・未使用の場合のみ承ります（送料お客様負担）。'
  },
  {
    id: 13,
    category: '返品・交換',
    question: '不良品が届いた場合はどうすればいいですか？',
    answer: '大変申し訳ございません。商品到着後、速やかにお電話またはメールにてご連絡ください。代替品の手配と、不良品の回収を迅速に対応いたします。往復送料は当社負担となります。'
  },
  {
    id: 14,
    category: '会員・アカウント',
    question: '会員登録は必須ですか？',
    answer: 'ご購入には会員登録が必要です。会員登録していただくことで、注文履歴の確認、配送先の保存、ポイントの蓄積などの便利な機能をご利用いただけます。'
  },
  {
    id: 15,
    category: '会員・アカウント',
    question: 'パスワードを忘れてしまいました。',
    answer: 'ログインページの「パスワードを忘れた方」リンクから、登録されているメールアドレスを入力してください。パスワード再設定用のメールをお送りいたします。'
  },
  {
    id: 16,
    category: '法人・大口注文',
    question: '法人での利用は可能ですか？',
    answer: 'はい、法人でのご利用を歓迎いたします。法人会員にご登録いただくと、請求書払い、見積書発行、専任担当者のアサインなど、法人様向けの特別サービスをご利用いただけます。'
  },
  {
    id: 17,
    category: '法人・大口注文',
    question: '大量注文や継続取引の割引はありますか？',
    answer: '月間取引量や年間契約に応じて、特別価格をご提案いたします。詳細は法人営業担当までお問い合わせください。お客様のニーズに合わせてカスタマイズいたします。'
  }
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全て');
  const [openItem, setOpenItem] = useState<number | null>(null);

  // カテゴリ一覧の取得
  const categories = ['全て', ...Array.from(new Set(faqData.map(item => item.category)))];

  // フィルタリングされたFAQアイテム
  const filteredFAQ = selectedCategory === '全て' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  // アコーディオンの開閉
  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">よくある質問（FAQ）</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          お客様からよくいただくご質問をまとめました。
          こちらで解決しない場合は、お気軽にお問い合わせください。
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* カテゴリフィルター */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">カテゴリで絞り込み</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ一覧 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            {filteredFAQ.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredFAQ.map((item) => (
                  <div key={item.id} className="p-6">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex justify-between items-start text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-2">
                            {item.category}
                          </span>
                          <span className="text-blue-600 font-medium text-sm">Q</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.question}
                        </h3>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            openItem === item.id ? 'transform rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>
                    
                    {openItem === item.id && (
                      <div className="mt-4 pl-6 border-l-4 border-blue-200">
                        <div className="flex items-start">
                          <span className="text-green-600 font-medium text-sm mr-2 mt-1">A</span>
                          <p className="text-gray-700 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">該当するFAQが見つかりませんでした。</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* お問い合わせ案内 */}
      <div className="mt-12 bg-blue-50 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            解決しない場合は
          </h2>
          <p className="text-blue-800 mb-6">
            こちらのFAQで解決しない場合は、お気軽にお問い合わせください。
            専門スタッフが丁寧にサポートいたします。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              お問い合わせフォーム
            </a>
            <div className="flex items-center justify-center text-blue-800">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>03-XXXX-XXXX（平日 9:00〜18:00）</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 