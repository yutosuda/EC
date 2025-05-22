# 建設資材ECサイト

建設資材を販売するためのECサイトプロジェクトです。フロントエンドはNext.js、バックエンドはExpress.js、データベースはMongoDBを使用しています。

## 機能

- 商品管理機能（商品登録・編集・削除・在庫管理）
- カート・購入機能・お気に入り登録
- 決済機能
- 会員機能
- 受注・発送管理機能（管理者向け）
- 商品検索・フィルター機能・ランキング機能
- コンテンツ管理機能（CMS）
- メール通知機能
- 分析・レポート機能
- など

## 技術スタック

- **フロントエンド**
  - Next.js
  - React
  - TypeScript
  - Tailwind CSS
  
- **バックエンド**
  - Node.js
  - Express.js
  - TypeScript
  - MongoDB (Mongoose)
  - JWT認証
  
- **インフラ**
  - MongoDB Atlas (予定)
  - Vercel (予定)

## 開発環境セットアップ

### 前提条件

- Node.js (v18以上)
- npm (v8以上)
- MongoDB（ローカルまたはMongoDB Atlas）

### インストール手順

1. リポジトリをクローン
```
git clone https://github.com/yourusername/construction-ec.git
cd construction-ec
```

2. 依存パッケージをインストール
```
npm install
```

3. 環境変数ファイルを作成
`.env.local`ファイルをプロジェクトルートに作成し、以下の変数を設定します：
```
# サーバーポート設定
PORT=5000

# Next.js設定
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# MongoDB接続情報
MONGODB_URI=mongodb://localhost:27017/construction-ec

# JWT設定
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

4. 開発サーバーを起動

フロントエンド（Next.js）:
```
npm run dev
```

バックエンド（Express.js）:
```
npm run backend:dev
```

5. ブラウザでアクセス
- フロントエンド: `http://localhost:3000`
- バックエンドAPI: `http://localhost:5000/api`

## API ドキュメント

主要なAPIエンドポイントは以下の通りです：

### 認証API
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報を取得
- `PUT /api/auth/change-password` - パスワード変更

### 商品API
- `GET /api/products` - 商品一覧を取得
- `GET /api/products/:id` - 商品詳細を取得
- `POST /api/products` - 商品を新規作成（管理者のみ）
- `PUT /api/products/:id` - 商品を更新（管理者のみ）
- `DELETE /api/products/:id` - 商品を削除（管理者のみ）

### カテゴリAPI
- `GET /api/categories` - カテゴリ一覧を取得
- `GET /api/categories/:id` - カテゴリ詳細を取得
- `POST /api/categories` - カテゴリを新規作成（管理者のみ）
- `PUT /api/categories/:id` - カテゴリを更新（管理者のみ）
- `DELETE /api/categories/:id` - カテゴリを削除（管理者のみ）

### 注文API
- `POST /api/orders` - 注文を作成（認証済みユーザーのみ）
- `GET /api/orders/my-orders` - 自分の注文履歴を取得（認証済みユーザーのみ）
- `GET /api/orders/:id` - 注文詳細を取得（認証済みユーザーのみ - 自分の注文のみ）
- `GET /api/orders` - 全注文一覧を取得（管理者のみ）
- `PUT /api/orders/:id/status` - 注文ステータスを更新（管理者のみ）

## ライセンス

ISC 