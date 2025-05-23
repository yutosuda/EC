import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | 建設資材ECサイト',
  description: '建設資材ECサイトのプライバシーポリシーです。お客様の個人情報の取り扱いについてご説明いたします。',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>
      
      <div className="bg-white rounded-lg shadow p-8">
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            最終更新日: 2024年1月1日
          </p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. 基本方針</h2>
              <p className="text-gray-700 leading-relaxed">
                建設資材株式会社（以下「当社」といいます。）は、お客様の個人情報を適切に保護することが、
                当社の事業活動の基本であり社会的責務であると認識しています。
                当社は、個人情報の保護に関する法律、その他関係法令等を遵守し、
                お客様の個人情報を適正に取り扱うとともに、安全管理について適切な措置を講じます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. 個人情報の定義</h2>
              <p className="text-gray-700 leading-relaxed">
                本プライバシーポリシーにおいて、個人情報とは、個人情報の保護に関する法律に規定する個人情報を指し、
                生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により
                特定の個人を識別することができるもの（他の情報と容易に照合することができ、
                それにより特定の個人を識別することができることとなるものを含みます。）をいいます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. 個人情報の収集方法</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>当社は、以下の方法で個人情報を収集することがあります。</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>お客様がサービスにご登録いただく際の入力フォーム</li>
                  <li>お客様からのお問い合わせ</li>
                  <li>アンケートやキャンペーンへのご参加</li>
                  <li>Cookieやアクセスログ等の技術的手段</li>
                  <li>業務上必要な範囲での第三者からの情報提供</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. 収集する個人情報の項目</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>当社が収集する個人情報は以下の通りです。</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>氏名、住所、電話番号、メールアドレス等の連絡先情報</li>
                  <li>生年月日、性別等の基本情報</li>
                  <li>クレジットカード情報等の決済に関する情報</li>
                  <li>サービスの利用履歴、購入履歴</li>
                  <li>お客様とのやり取りの履歴</li>
                  <li>アクセスログ、IPアドレス、Cookie情報</li>
                  <li>その他サービス提供に必要な情報</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. 個人情報の利用目的</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>当社は、収集した個人情報を以下の目的で利用いたします。</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>サービスの提供・運営</li>
                  <li>お客様からのお問い合わせへの対応</li>
                  <li>商品の受注・発送・代金決済</li>
                  <li>メンテナンス、重要なお知らせなど必要に応じたご連絡</li>
                  <li>サービスの改善・新サービスの開発</li>
                  <li>マーケティング・広告配信</li>
                  <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定と利用拒否</li>
                  <li>上記の利用目的に付随する目的</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. 個人情報の第三者提供</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  当社は、以下のいずれかに該当する場合を除いて、あらかじめお客様の同意を得ることなく、
                  第三者に個人情報を提供することはありません。
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>法令に基づく場合</li>
                  <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                  <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                  <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. 個人情報の委託</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  当社は、利用目的の達成に必要な範囲において、個人情報の処理を外部に委託することがあります。
                  この場合、個人情報を適正に取り扱っていると認められる委託先を選定し、
                  委託契約等において個人情報の適正管理・機密保持などによりお客様の個人情報の漏洩等なきよう
                  適切な管理を実施させます。
                </p>
                <p>主な委託先は以下の通りです。</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>決済代行会社</li>
                  <li>配送業者</li>
                  <li>システム開発・保守会社</li>
                  <li>コールセンター運営会社</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. 個人情報の保存期間</h2>
              <p className="text-gray-700 leading-relaxed">
                当社は、個人情報の利用目的が達成された後、法令等により保存が義務付けられている場合を除き、
                遅滞なく個人情報を削除いたします。ただし、以下の期間は保存させていただきます。
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-3 text-gray-700">
                <li>会員情報: 退会後1年間</li>
                <li>購入履歴: 購入から5年間</li>
                <li>お問い合わせ履歴: 対応完了から1年間</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. 個人情報の開示等の請求</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  お客様は、当社の保有する自己の個人情報について、以下の権利を有しています。
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>個人情報の利用目的の通知請求</li>
                  <li>個人情報の開示請求</li>
                  <li>個人情報の内容の訂正・追加または削除の請求</li>
                  <li>個人情報の利用の停止または消去の請求</li>
                  <li>個人情報の第三者提供の停止の請求</li>
                </ul>
                <p>
                  これらの請求をする場合は、下記お問い合わせ先までご連絡ください。
                  なお、請求者がご本人であることを確認させていただくため、
                  運転免許証等の本人確認書類の提示をお願いする場合があります。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. 個人情報の安全管理措置</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>当社は、個人情報の漏洩、滅失または毀損の防止その他の個人情報の安全管理のために、以下の措置を講じています。</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>個人情報保護規程の策定</li>
                  <li>従業員に対する個人情報保護研修の実施</li>
                  <li>個人情報へのアクセス制御</li>
                  <li>個人情報を取り扱うシステムへのアクセス権限の管理</li>
                  <li>個人情報の暗号化</li>
                  <li>外部からの不正アクセスを防止するファイアウォール等の設置</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Cookieの利用について</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  当社のWebサイトでは、お客様により良いサービスを提供するため、
                  Cookieを使用することがあります。Cookieとは、WebサイトがWebブラウザを通じて
                  お客様のコンピュータに送信する小さなテキストファイルです。
                </p>
                <p>Cookieの使用目的は以下の通りです。</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>お客様の利便性向上</li>
                  <li>ウェブサイトの利用状況の分析</li>
                  <li>広告の効果測定</li>
                  <li>お客様の興味・関心に応じた広告の配信</li>
                </ul>
                <p>
                  お客様は、ブラウザの設定によりCookieの受け取りを拒否することができますが、
                  その場合、サービスの一部がご利用いただけない場合があります。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. プライバシーポリシーの変更</h2>
              <p className="text-gray-700 leading-relaxed">
                当社は、法令の変更等に伴い、本プライバシーポリシーを変更することがあります。
                変更後のプライバシーポリシーは、当社Webサイトに掲載した時点で効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. お問い合わせ窓口</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください。</p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p><strong>建設資材株式会社 個人情報保護窓口</strong></p>
                  <p>住所: 〒100-0001 東京都千代田区千代田1-1-1 建設ビル5F</p>
                  <p>電話: 03-XXXX-XXXX</p>
                  <p>メール: privacy@construction-ec.com</p>
                  <p>受付時間: 平日 9:00〜18:00（土日祝日・年末年始を除く）</p>
                </div>
              </div>
            </section>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              以上
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 