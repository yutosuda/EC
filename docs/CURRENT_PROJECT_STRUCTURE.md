# 📁 **現在のプロジェクト構造詳細**

---

## 🏗️ **プロジェクト全体構造**

```
EC/
├── frontend/                    ← Next.js 15.3.2 アプリケーション
│   ├── src/
│   │   ├── app/                ← App Router (22ページ)
│   │   ├── components/         ← React コンポーネント
│   │   ├── contexts/           ← Zustand ストア
│   │   ├── hooks/              ← カスタムフック
│   │   ├── api/                ← API クライアント
│   │   ├── styles/             ← TailwindCSS
│   │   └── middleware.ts       ← Next.js ミドルウェア
│   ├── public/                 ← 静的ファイル
│   ├── package.json
│   └── tailwind.config.js
├── backend/                     ← Express.js API サーバー
│   ├── src/
│   │   ├── controllers/        ← API コントローラー
│   │   ├── models/             ← MongoDB モデル
│   │   ├── routes/             ← API ルート
│   │   ├── services/           ← ビジネスロジック
│   │   ├── middlewares/        ← Express ミドルウェア
│   │   ├── config/             ← 設定ファイル
│   │   └── templates/          ← メールテンプレート
│   └── package.json
├── shared/                      ← 共通型定義
└── docs/                        ← ドキュメント
```

---

## 🎨 **フロントエンド詳細構造**

### **📱 App Router構造 (22ページ)**
```
frontend/src/app/
├── page.tsx                    ← ホームページ
├── layout.tsx                  ← ルートレイアウト
├── template.tsx                ← テンプレート
├── loading.tsx                 ← ローディング
├── not-found.tsx              ← 404ページ
├── products/
│   ├── page.tsx               ← 商品一覧
│   └── [id]/
│       ├── page.tsx           ← 商品詳細
│       └── components/        ← 商品詳細専用コンポーネント
├── categories/
│   ├── page.tsx               ← カテゴリ一覧
│   └── [slug]/
│       └── page.tsx           ← カテゴリ詳細
├── cart/
│   └── page.tsx               ← カート
├── checkout/
│   ├── page.tsx               ← チェックアウト
│   └── complete/
│       └── page.tsx           ← 注文完了
├── account/
│   └── page.tsx               ← マイページ
├── admin/
│   ├── page.tsx               ← 管理ダッシュボード
│   ├── products/
│   │   ├── page.tsx           ← 商品管理
│   │   └── [id]/
│   │       └── page.tsx       ← 商品編集
│   └── orders/
│       └── page.tsx           ← 注文管理
├── login/
│   └── page.tsx               ← ログイン
├── register/
│   └── page.tsx               ← 新規登録
├── forgot-password/
│   └── page.tsx               ← パスワードリセット
├── reset-password/
│   └── page.tsx               ← パスワード再設定
├── contact/
│   └── page.tsx               ← お問い合わせ
├── about/
│   └── page.tsx               ← 会社概要
├── terms/
│   └── page.tsx               ← 利用規約
├── privacy/
│   └── page.tsx               ← プライバシーポリシー
└── faq/
    └── page.tsx               ← よくある質問
```

### **🧩 コンポーネント構造**
```
frontend/src/components/
├── Layout/
│   ├── Header.tsx             ← ナビゲーション・ヘッダー
│   ├── Footer.tsx             ← フッター
│   └── Layout.tsx             ← メインレイアウト
└── Auth/
    ├── LoginForm.tsx          ← ログインフォーム
    ├── RegisterForm.tsx       ← 登録フォーム
    └── PasswordResetForm.tsx  ← パスワードリセット
```

### **🗄️ 状態管理構造**
```
frontend/src/contexts/
├── authStore.ts               ← 認証状態管理 (Zustand)
└── cartStore.ts               ← カート状態管理 (Zustand)
```

### **🪝 カスタムフック**
```
frontend/src/hooks/
└── useHydration.ts            ← SSRハイドレーション対応
```

### **🌐 API クライアント**
```
frontend/src/api/
└── apiClient.ts               ← HTTP クライアント
```

---

## 🔧 **バックエンド詳細構造**

### **📡 API エンドポイント**
```
backend/src/routes/
├── auth.routes.js             ← 認証 API
├── user.routes.js             ← ユーザー管理 API
├── product.routes.js          ← 商品 API
├── category.routes.js         ← カテゴリ API
├── order.routes.js            ← 注文 API
├── review.routes.js           ← レビュー API
└── upload.routes.js           ← 画像アップロード API
```

### **🎮 コントローラー**
```
backend/src/controllers/
├── AuthController.js          ← 認証処理
├── UserController.js          ← ユーザー管理
├── ProductController.js       ← 商品管理
├── CategoryController.js      ← カテゴリ管理
├── OrderController.js         ← 注文処理
├── ReviewController.js        ← レビュー処理
└── UploadController.js        ← 画像アップロード
```

### **📊 データベースモデル**
```
backend/src/models/
├── User.js                    ← ユーザーモデル
├── Product.js                 ← 商品モデル
├── Category.js                ← カテゴリモデル
├── Order.js                   ← 注文モデル
└── Review.js                  ← レビューモデル
```

### **⚙️ サービス層**
```
backend/src/services/
├── EmailService.js            ← メール送信サービス
└── ImageService.js            ← 画像処理サービス
```

### **📧 メールテンプレート**
```
backend/src/templates/email/
├── welcome.hbs                ← 登録完了メール
├── order-confirmation.hbs     ← 注文確認メール
├── payment-confirmation.hbs   ← 支払い確認メール
├── shipping-notification.hbs  ← 配送通知メール
├── password-reset.hbs         ← パスワードリセット
├── contact-confirmation.hbs   ← お問い合わせ確認
├── contact-notification.hbs   ← お問い合わせ通知
└── new-order-notification.hbs ← 新規注文通知
```

---

## 🎯 **設定ファイル**

### **フロントエンド設定**
```
frontend/
├── next.config.js             ← Next.js 設定
├── tailwind.config.js         ← TailwindCSS 設定
├── tsconfig.json              ← TypeScript 設定
└── .env.local                 ← 環境変数
```

### **バックエンド設定**
```
backend/
├── package.json               ← 依存関係
└── .env                       ← 環境変数
```

### **プロジェクト全体設定**
```
EC/
├── docker-compose.yml         ← Docker 設定
├── package.json               ← ワークスペース設定
└── tsconfig.json              ← TypeScript 設定
```

---

## 📈 **実装済み機能一覧**

### **✅ 認証・ユーザー管理**
- JWT認証システム
- ユーザー登録・ログイン
- パスワードリセット
- プロフィール管理

### **✅ 商品・カテゴリ管理**
- 商品CRUD操作
- カテゴリ管理
- 商品検索・フィルタ
- 画像アップロード (Sharp最適化)

### **✅ 購入フロー**
- カート機能 (永続化)
- 注文処理
- 在庫管理
- 価格計算

### **✅ レビューシステム**
- 星評価
- コメント投稿
- レビュー表示

### **✅ 通知システム**
- 8種類の自動メール通知
- Handlebars テンプレート
- SMTP/SendGrid 対応

### **✅ 管理者機能**
- 商品管理
- 注文管理
- ユーザー管理

---

## 🎨 **UI/UX改善対象ファイル**

### **優先度高**
```
frontend/src/app/page.tsx              ← ホームページ全体
frontend/src/components/Layout/Header.tsx  ← ナビゲーション
frontend/src/app/products/page.tsx    ← 商品一覧
frontend/src/app/products/[id]/page.tsx ← 商品詳細
```

### **優先度中**
```
frontend/src/app/cart/page.tsx         ← カートページ
frontend/src/app/checkout/page.tsx     ← チェックアウト
frontend/src/components/Auth/*.tsx     ← 認証フォーム
```

### **優先度低**
```
frontend/src/components/Layout/Footer.tsx ← フッター
frontend/src/app/admin/*.tsx           ← 管理者ページ
frontend/src/app/(static)/*.tsx        ← 静的ページ
```

---

**🚀 UI/UXデザイン改善の準備完了！**  
**次のチャットでデザイン情報をお待ちしています 🎨** 