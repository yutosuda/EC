import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '利用規約 | 建設資材ECサイト',
  description: '建設資材ECサイトの利用規約です。サービスをご利用いただく前に必ずお読みください。',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">利用規約</h1>
      
      <div className="bg-white rounded-lg shadow p-8">
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            最終更新日: 2024年1月1日
          </p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">第1条（適用）</h2>
              <p className="text-gray-700 leading-relaxed">
                この利用規約（以下「本規約」といいます。）は、建設資材株式会社（以下「当社」といいます。）が提供する
                建設資材ECサイト（以下「本サービス」といいます。）の利用条件を定めるものです。
                本サービスをご利用になる場合には、本規約にご同意いただいたものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第2条（利用登録）</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  1. 本サービスの利用を希望する方は、本規約に同意の上、当社の定める方法によって利用登録を申請し、
                  当社がこれを承認することによって、利用登録が完了するものとします。
                </p>
                <p>
                  2. 当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、
                  その理由については一切の開示義務を負わないものとします。
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                  <li>本規約に違反したことがある者からの申請である場合</li>
                  <li>その他、当社が利用登録を相当でないと判断した場合</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第3条（禁止事項）</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-3">利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>法令または公序良俗に違反する行為</li>
                  <li>犯罪行為に関連する行為</li>
                  <li>当社、本サービスの他の利用者、または第三者のサーバーまたはネットワークの機能を破壊したり、
                      妨害したりする行為</li>
                  <li>当社のサービスの運営を妨害するおそれのある行為</li>
                  <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
                  <li>不正アクセスをし、またはこれを試みる行為</li>
                  <li>他の利用者に成りすます行為</li>
                  <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                  <li>その他、当社が不適切と判断する行為</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第4条（本サービスの提供の停止等）</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  1. 当社は、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく
                  本サービスの全部または一部の提供を停止または中断することができるものとします。
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                  <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                  <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                  <li>その他、当社が本サービスの提供が困難と判断した場合</li>
                </ul>
                <p>
                  2. 当社は、本サービスの提供の停止または中断により、利用者または第三者が被ったいかなる不利益
                  または損害についても、一切の責任を負わないものとします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第5条（著作権）</h2>
              <p className="text-gray-700 leading-relaxed">
                本サービスに掲載されている情報に関する著作権その他の知的財産権は、当社または当社にその利用を
                許諾した権利者に帰属し、利用者は無断で複製、譲渡、貸与、翻訳、改変、転載、公衆送信（送信可能化を含みます。）、
                伝送、配布、出版、営業使用等をしてはならないものとします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第6条（利用制限および登録抹消）</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  1. 当社は、利用者が以下のいずれかに該当する場合には、事前の通知なく、
                  利用者に対して本サービスの全部もしくは一部の利用を制限し、または利用者としての登録を抹消することができるものとします。
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>本規約のいずれかの条項に違反した場合</li>
                  <li>登録事項に虚偽の事実があることが判明した場合</li>
                  <li>決済手段として当該利用者が届け出たクレジットカードが利用停止となった場合</li>
                  <li>料金等の支払債務の不履行があった場合</li>
                  <li>当社からの連絡に対し、一定期間返答がない場合</li>
                  <li>本サービスについて、最後の利用から一定期間利用がない場合</li>
                  <li>その他、当社が本サービスの利用を適当でないと判断した場合</li>
                </ul>
                <p>
                  2. 当社は、本条に基づき当社が行った行為により利用者に生じた損害について、一切の責任を負いません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第7条（保証の否認および免責事項）</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  1. 当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、
                  特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）が
                  ないことを明示的にも黙示的にも保証しておりません。
                </p>
                <p>
                  2. 当社は、本サービスに起因して利用者に生じたあらゆる損害について、当社の故意または重過失による場合を除き、
                  一切の責任を負いません。ただし、本サービスに関する当社と利用者との間の契約
                  （本規約を含みます。）が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
                </p>
                <p>
                  3. 前項ただし書に定める場合であっても、当社は、当社の過失（重過失を除きます。）による
                  債務不履行または不法行為により利用者に生じた損害のうち特別な事情から生じた損害
                  （当社または利用者が損害発生につき予見し、または予見し得た場合を含みます。）について一切の責任を負いません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第8条（サービス内容の変更等）</h2>
              <p className="text-gray-700 leading-relaxed">
                当社は、利用者への事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、
                利用者はこれに同意するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第9条（利用規約の変更）</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  1. 当社は以下の場合には、利用者の個別の同意を要せず、本規約を変更することができるものとします。
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>本規約の変更が利用者の一般の利益に適合するとき。</li>
                  <li>本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性
                      その他の変更に係る事情に照らして合理的なものであるとき。</li>
                </ul>
                <p>
                  2. 当社はユーザーに対し、前項による本規約の変更にあたり、事前に、本規約を変更する旨及び
                  変更後の本規約の内容並びにその効力発生時期を通知いたします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第10条（個人情報の取扱い）</h2>
              <p className="text-gray-700 leading-relaxed">
                当社は、本サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い
                適切に取り扱うものとします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第11条（通知または連絡）</h2>
              <p className="text-gray-700 leading-relaxed">
                利用者と当社との間の通知または連絡は、当社の定める方法によって行うものとします。
                当社は、利用者から、当社が別途定める方式に従った変更届け出がない限り、
                現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、
                これらは、発信時に利用者へ到達したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第12条（権利義務の譲渡の禁止）</h2>
              <p className="text-gray-700 leading-relaxed">
                利用者は、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは
                義務を第三者に譲渡し、または担保に供することはできません。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">第13条（準拠法・裁判管轄）</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>1. 本規約の解釈にあたっては、日本法を準拠法とします。</p>
                <p>
                  2. 本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を
                  専属的合意管轄とします。
                </p>
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