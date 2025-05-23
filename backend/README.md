# 建設資材ECサイト - バックエンドAPI

## 概要
建設資材ECサイトのRESTful APIです。

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env`ファイルを作成し、以下の設定を行ってください：

```bash
# データベース設定
MONGODB_URI=mongodb://localhost:27017/construction-ec

# JWT設定
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# サーバー設定
PORT=5000
NODE_ENV=development

# フロントエンド設定
FRONTEND_URL=http://localhost:3000

# Stripe決済設定
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# メール設定 (SMTP使用の場合)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password

# SendGrid使用の場合 (SMTPより優先)
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# メール関連設定
MAIL_FROM=noreply@construction-ec.com
SUPPORT_EMAIL=support@construction-ec.com
ADMIN_EMAIL=admin@construction-ec.com
```

### 3. データベースの起動
MongoDBを起動してください。

### 4. 開発サーバーの起動
```bash
npm run dev
```

## メール通知システム

### 概要
以下のタイミングで自動メール通知が送信されます：

#### 顧客向け通知
- 会員登録完了時
- 注文受付時
- 決済完了時
- 発送完了時
- パスワードリセット時
- お問い合わせ受付時

#### 管理者向け通知
- 新規注文受付時
- お問い合わせ受信時

### メール設定

#### SMTP設定（Gmail例）
1. Gmailでアプリパスワードを生成
2. 以下を`.env`に設定：
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### SendGrid設定（推奨）
1. SendGridアカウントを作成
2. API Keyを生成
3. 以下を`.env`に設定：
```bash
SENDGRID_API_KEY=SG.your-sendgrid-api-key
```

### メールテンプレート
HTMLメールテンプレートは`src/templates/email/`に格納されています：

- `welcome.hbs` - 会員登録完了
- `order-confirmation.hbs` - 注文受付完了
- `payment-confirmation.hbs` - 決済完了
- `shipping-notification.hbs` - 発送完了
- `password-reset.hbs` - パスワードリセット
- `contact-confirmation.hbs` - お問い合わせ受付（顧客向け）
- `contact-notification.hbs` - お問い合わせ通知（管理者向け）
- `new-order-notification.hbs` - 新規注文通知（管理者向け）

## 利用可能なスクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm start` - プロダクションサーバー起動
- `npm test` - テスト実行
- `npm run type-check` - TypeScript型チェック
- `npm run lint` - ESLint実行

## API仕様
サーバー起動後、Swagger UIにアクセスしてAPI仕様を確認できます：
http://localhost:5000/api-docs

## ディレクトリ構成
```
src/
├── config/          # 設定ファイル
├── controllers/     # コントローラー
├── middlewares/     # ミドルウェア
├── models/          # Mongooseモデル
├── routes/          # ルーティング
├── services/        # ビジネスロジック
├── templates/       # メールテンプレート
│   └── email/       # Handlebarsテンプレート
├── tests/           # テストファイル
└── utils/           # ユーティリティ
``` 