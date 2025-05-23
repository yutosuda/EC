'use client';

import React, { useState } from 'react';
import { Metadata } from 'next';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  category: string;
  subject: string;
  message: string;
  agreePrivacy: boolean;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    company: '',
    category: '',
    subject: '',
    message: '',
    agreePrivacy: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'none' | 'success' | 'error'>('none');

  const categories = [
    { value: '', label: '選択してください' },
    { value: 'product', label: '商品について' },
    { value: 'order', label: '注文・購入について' },
    { value: 'delivery', label: '配送について' },
    { value: 'payment', label: '支払いについて' },
    { value: 'return', label: '返品・交換について' },
    { value: 'account', label: 'アカウントについて' },
    { value: 'technical', label: '技術的な質問' },
    { value: 'business', label: '法人・大口注文について' },
    { value: 'other', label: 'その他' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('none');

    try {
      // ここで実際のAPI呼び出しを行う
      // 現在はモックレスポンス
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        category: '',
        subject: '',
        message: '',
        agreePrivacy: false
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.category && 
                     formData.subject && formData.message && formData.agreePrivacy;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">お問い合わせ</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* お問い合わせフォーム */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold mb-6">お問い合わせフォーム</h2>
            
            {submitStatus === 'success' && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>お問い合わせを受け付けました。2営業日以内にご回答いたします。</span>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>送信中にエラーが発生しました。しばらく時間を置いてから再度お試しください。</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="田中 太郎"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="example@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="03-1234-5678"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    会社名・団体名
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="株式会社○○"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  お問い合わせ種類 <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="お問い合わせの件名をご入力ください"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="お問い合わせ内容を詳しくご記入ください"
                />
              </div>

              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreePrivacy"
                    checked={formData.agreePrivacy}
                    onChange={handleInputChange}
                    required
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-700">
                    <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                      プライバシーポリシー
                    </a>
                    に同意します <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    isFormValid && !isSubmitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? '送信中...' : '送信する'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 連絡先情報 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">お電話でのお問い合わせ</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="font-medium">03-XXXX-XXXX</p>
                  <p className="text-sm text-gray-600">平日 9:00〜18:00</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium">info@construction-ec.com</p>
                  <p className="text-sm text-gray-600">24時間受付</p>
                </div>
              </div>
            </div>
          </div>

          {/* 営業時間 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">営業時間</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>月〜金</span>
                <span>9:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>土曜日</span>
                <span>9:00 - 17:00</span>
              </div>
              <div className="flex justify-between">
                <span>日曜・祝日</span>
                <span className="text-red-600">休業</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              ※ お急ぎの場合は、まずお電話でご連絡ください。
            </p>
          </div>

          {/* 所在地 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">所在地</h3>
            <div className="space-y-2">
              <p className="font-medium">建設資材株式会社</p>
              <p className="text-sm text-gray-700">
                〒100-0001<br />
                東京都千代田区千代田1-1-1<br />
                建設ビル5F
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">最寄駅</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• JR東京駅 徒歩5分</li>
                  <li>• 地下鉄大手町駅 徒歩3分</li>
                  <li>• 地下鉄二重橋前駅 徒歩7分</li>
                </ul>
              </div>
            </div>
          </div>

          {/* よくある質問へのリンク */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">よくある質問</h3>
            <p className="text-blue-800 text-sm mb-4">
              お問い合わせの前に、よくある質問もご確認ください。
            </p>
            <a
              href="/faq"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              FAQを見る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 