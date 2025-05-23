# 建設資材ECサイト 実装計画書

## 概要

本ドキュメントは、建設資材ECサイトのより詳細な実装計画を示します。プロジェクト分析に基づき、優先的に実装すべき機能とその具体的な手順を記載しています。

## 開発環境

### 環境設定とバージョン管理

**開発環境の構成**
- **Next.js**: v15.3.2 
  - 最新のApp Routerを利用（設定例: `next.config.js`で`experimental.typedRoutes`を有効化）
  - ビルド出力先は`.next`ディレクトリ（`distDir: '.next'`）
- **TypeScript**: v5.8.3以上
- **TailwindCSS**: v4.1.7
  - 最新のTailwindCSSではPostCSSプラグインが分離されており、`@tailwindcss/postcss`を使用
  - `postcss.config.js`での設定方法：
    ```js
    module.exports = {
      plugins: {
        '@tailwindcss/postcss': {},
        autoprefixer: {},
      },
    }
    ```
- **パッケージマネージャー**: npm または pnpm（一貫性のために一方に統一）

**必須の追加パッケージ**
- **API通信用**: fetch（Next.js組み込み）またはカスタムAPIクライアント
- **状態管理**: Zustand
- **フォーム管理**: React Hook Form + Zod
- **APIバリデーション**: Zod
- **テスト**: Jest, React Testing Library, Supertest

**開発フロー**
1. 環境変数設定（`.env.local`）
2. 依存関係インストール（`npm install`）
3. 開発サーバー起動（`npm run dev`）
4. ビルド実行（`npm run build`）
5. バックエンド実行（`npm run backend:dev`）
6. 両方同時実行（`npm run dev:all`）

**環境変数一覧**
```
# API設定
API_URL=http://localhost:5000/api

# データベース設定
MONGODB_URI=mongodb://localhost:27017/construction-ec

# JWT設定
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Stripe設定
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 実装フェーズ

実装は以下の3つのフェーズに分けて進めます。

### フェーズ1: コア機能実装（4週間）

#### 週1-2: 商品表示・検索機能

**商品一覧ページ**
- 商品カードコンポーネント作成
  - 画像、商品名、価格、カテゴリ表示
  - アクション（カートに追加、詳細を見る）
- ページネーション実装
- 商品APIとの連携
- ローディング状態の表示
- エラーハンドリング

**商品詳細ページ**
- 商品詳細表示
  - 複数画像表示機能
  - 商品スペック表示
  - 数量選択と在庫チェック
  - カート追加ボタン
- 関連商品表示
- レビュー表示セクション（★評価）

**カテゴリページ**
- カテゴリツリー表示
- カテゴリごとの商品フィルタリング
- パンくずリスト実装

**検索機能**
- 検索ボックス実装
- 検索結果表示ページ
- オートコンプリート機能

#### 週3-4: カート・注文・認証機能

**カート機能**
- カートコンテキスト作成
- カート追加・削除・数量変更
- カート状態の永続化（localStorage）
- カート小計・合計金額表示
- カート内商品の在庫チェック

**注文機能**
- 配送先情報入力フォーム
- 支払い方法選択
- 注文確認ページ
- 注文APIとの連携
- 注文完了ページ

**認証・会員機能**
- ログイン・サインアップフォーム
- JWT管理の実装
- 認証状態のコンテキスト管理
- 認証必須ルートの保護
- パスワードリセット機能

### フェーズ2: 機能拡張・UI洗練（3週間）

#### 週5-6: 機能拡張

**検索・フィルタリング強化**
- 価格帯フィルター
- 複数条件での絞り込み
- 並べ替え機能（新着順、価格順など）
- 検索結果のキャッシュ

**ユーザー機能拡張**
- マイページ実装
  - ユーザー情報編集
  - 注文履歴一覧・詳細
  - お気に入り商品管理
- アドレス帳管理

**決済連携完成**
- Stripeチェックアウト統合
- クレジットカード入力フォーム
- 決済エラーハンドリング
- 注文確認メール送信

#### 週7: UI/UX改善

**全体デザイン調整**
- デザインシステムの整備
  - 色彩・フォント・スペーシングの統一
  - アニメーション効果追加
- モバイル最適化
  - タッチ操作の改善
  - モバイルメニュー実装

**ユーザビリティ向上**
- フォームバリデーション強化
- インタラクティブなフィードバック
- ローディング表示の最適化
- エラーメッセージの改善

**アクセシビリティ対応**
- WAI-ARIA属性の追加
- キーボード操作のサポート
- コントラスト比の確保
- スクリーンリーダー対応

### フェーズ3: 品質向上・最終調整（3週間）

#### 週8-9: テスト強化

**バックエンドテスト**
- ユニットテスト拡充
- エンドポイントテスト
- 境界値テスト
- パフォーマンステスト

**フロントエンドテスト**
- コンポーネントテスト導入
- ユーザーフローのE2Eテスト
- スナップショットテスト
- クロスブラウザテスト

**セキュリティ強化**
- CSRFトークン実装
- 入力サニタイズ強化
- レート制限の導入
- HTTPセキュリティヘッダー設定

#### 週10: パフォーマンス最適化・デプロイ準備

**パフォーマンス最適化**
- 画像最適化
  - WebP形式の採用
  - 遅延読み込み実装
- バンドルサイズ最適化
  - コード分割
  - ツリーシェイキング
- キャッシュ戦略の実装

**デプロイ準備**
- CI/CD設定
  - GitHub Actions設定
  - テスト自動化
- 環境変数管理
- 監視・ロギング設定
  - エラートラッキング
  - アクセス解析

## 技術的実装詳細

### フロントエンド

#### 状態管理
- Zustandを使用したグローバル状態管理
- 主要な状態:
  - 認証状態
  - カート状態
  - UI状態（ローディング、エラーなど）

```typescript
// 認証状態の例
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: UserSignupData) => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      set({ user: response.user, isAuthenticated: true, isLoading: false });
      // トークンの保存
      apiClient.setToken(response.token);
      localStorage.setItem('auth_token', response.token);
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    apiClient.clearToken();
    set({ user: null, isAuthenticated: false });
  },
  
  signup: async (userData) => {
    // 実装内容
  }
}));
```

#### APIクライアント改善
- エラーハンドリング強化
- 型安全性の向上
- リクエストのキャッシュ

```typescript
class ApiClient {
  // 既存コードに加えて...
  
  // キャッシュの実装
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5分
  
  // キャッシュありのGET
  async getCached<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const cacheKey = url.toString();
    
    // キャッシュチェック
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
    
    // キャッシュにない場合は取得してキャッシュ
    const data = await this.get<T>(endpoint, params);
    this.cache.set(cacheKey, { data, timestamp: now });
    
    return data;
  }
  
  // 型付きエラー
  private async handleError(response: Response): Promise<ApiError> {
    let message = `API Error: ${response.status}`;
    let details = null;
    
    try {
      const errorData = await response.json();
      message = errorData.message || message;
      details = errorData.details;
    } catch (e) {
      // JSONパースエラー
    }
    
    const error = new ApiError(message);
    error.status = response.status;
    error.details = details;
    return error;
  }
}

// 型付きエラークラス
class ApiError extends Error {
  status: number = 500;
  details: any = null;
  
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
```

#### コンポーネント設計
- Atomicデザインアプローチの採用
  - Atoms: ボタン、インプット、アイコンなど
  - Molecules: 検索ボックス、商品カードなど
  - Organisms: ヘッダー、商品リスト、フォームなど
  - Templates: ページレイアウト
  - Pages: 実際のページコンポーネント

```typescript
// Atom: ボタン
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  children,
  onClick,
  disabled,
  fullWidth,
}) => {
  // 実装内容
};

// Molecule: 商品カード
interface ProductCardProps {
  product: ProductType;
  onAddToCart: (product: ProductType) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <img 
        src={product.mainImage || '/placeholder-image.jpg'} 
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.manufacturer}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="font-bold text-lg">¥{product.price.toLocaleString()}</span>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => onAddToCart(product)}
          >
            カートに追加
          </Button>
        </div>
      </div>
    </div>
  );
};
```

### バックエンド

#### バリデーション強化
- Zodによるスキーマ検証の導入

```typescript
import { z } from 'zod';

// 商品作成スキーマ
const productCreateSchema = z.object({
  name: z.string().min(1, '商品名は必須です'),
  description: z.string().min(10, '説明は10文字以上必要です'),
  price: z.number().min(1, '価格は1以上である必要があります'),
  sku: z.string().min(1, 'SKUは必須です'),
  category: z.string().uuid('有効なカテゴリIDを指定してください'),
  manufacturer: z.string().min(1, 'メーカーは必須です'),
  stock: z.number().int().min(0, '在庫は0以上である必要があります'),
  isUsed: z.boolean().optional(),
  specifications: z.record(z.string()).optional(),
  images: z.array(z.string().url('有効な画像URLを指定してください')).optional(),
});

// リクエストボディバリデーション用ミドルウェア
export const validateBody = (schema: z.ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'バリデーションエラー',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};

// コントローラーで使用
router.post(
  '/',
  asyncHandler(authMiddleware.verifyToken),
  asyncHandler(authMiddleware.verifyAdmin),
  validateBody(productCreateSchema),
  asyncHandler(productController.createProduct)
);
```

#### セキュリティ強化
- レート制限の導入
- CSRFトークン実装

```typescript
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';

// レート制限設定
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分間
  max: 100, // IPごとに100リクエストまで
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'リクエスト数が制限を超えました。しばらく経ってから再試行してください。',
  }
});

// 認証エンドポイント用のより厳しい制限
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 10, // IPごとに10回まで
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'ログイン試行回数が制限を超えました。1時間後に再試行してください。',
  }
});

// CSRFトークン設定
const csrfProtection = csrf({ cookie: true });

// ルーターに適用
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// CSRF保護が必要なルートに適用
app.use('/api/orders', csrfProtection);
app.use('/api/cart', csrfProtection);
app.use('/api/auth', csrfProtection);
```

#### パフォーマンス最適化
- クエリ最適化
- キャッシュ導入

```typescript
import NodeCache from 'node-cache';

// メモリキャッシュ
const cache = new NodeCache({ stdTTL: 300 }); // 5分

// キャッシュミドルウェア
const cacheMiddleware = (ttl = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // POSTやPUT、DELETE要求にはキャッシュを適用しない
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = cache.get(key);
    
    if (cachedBody) {
      res.send(cachedBody);
      return;
    }
    
    const originalSend = res.send;
    res.send = function(body) {
      cache.set(key, body, ttl);
      originalSend.call(this, body);
      return this;
    };
    
    next();
  };
};

// 人気カテゴリやホットセール商品などの頻繁にアクセスされるエンドポイントにキャッシュを適用
app.get('/api/products/featured', cacheMiddleware(600), productController.getFeaturedProducts);
app.get('/api/categories/popular', cacheMiddleware(3600), categoryController.getPopularCategories);
```

## 予想される課題と対策

### 1. パフォーマンス課題
- **問題**: 大量のSKU管理によるパフォーマンス低下
- **対策**:
  - データベースインデックス最適化
  - ページネーション・無限スクロール実装
  - 検索結果のキャッシュ
  - 画像の最適化（WebP形式、サイズ最適化）

### 2. UX/UI整合性
- **問題**: 様々な画面サイズでのUX整合性維持
- **対策**:
  - コンポーネントライブラリの整備
  - デザインシステムの構築
  - モバイルファーストアプローチ
  - 徹底したクロスブラウザテスト

### 3. セキュリティリスク
- **問題**: 決済情報や個人情報の取り扱いに伴うリスク
- **対策**:
  - 決済処理はStripeに完全委託
  - データ暗号化
  - 定期的なセキュリティ監査
  - XSS、CSRF、SQLインジェクション対策の徹底

### 4. スケーラビリティ
- **問題**: 商品数やトラフィック増加に伴うスケーリング課題
- **対策**:
  - スケーラブルなアーキテクチャ設計
  - インフラのコンテナ化
  - 負荷テストの実施
  - キャッシュ戦略の導入

## 必要なリソースと見積もり

### 開発リソース
- フロントエンド開発: 1〜2名
- バックエンド開発: 1〜2名
- QAテスト: 1名
- デザイン: 1名

### 開発環境
- ローカル開発環境
- ステージング環境
- 本番環境

### 外部サービス
- MongoDB Atlas (データベース)
- Stripe (決済処理)
- AWS/GCP (ホスティング)
- GitHub (ソース管理)
- GitHub Actions (CI/CD)

## まとめ

本実装計画は、建設資材ECサイトの効率的かつ段階的な開発を目指しています。各フェーズで明確な目標を設定し、着実に機能を拡充していくことで、高品質なECサイトを構築します。特に初期段階ではMVP（Minimum Viable Product）の実現に集中し、コア機能を確実に実装することを優先します。

定期的な進捗確認とフィードバックサイクルを通じて、柔軟に計画を調整しながら進めていきます。 