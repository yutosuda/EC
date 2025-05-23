/**
 * 統合テスト用のユーティリティ関数
 */
import { Express } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ApiClientMock } from '../mocks/apiClientMock';
import { setupBeforeEach, teardownAfterEach } from '../setup';
import { 
  createMockPaymentRoutes, 
  createMockProductRoutes, 
  createMockCategoryRoutes,
  createMockAuthRoutes
} from '../mocks/routesMock';

// テスト用サーバーとクライアント
interface TestEnvironment {
  apiClient: ApiClientMock;
  mongod: MongoMemoryServer;
}

/**
 * テスト環境のセットアップ
 * @param app Expressアプリケーション
 * @returns テスト環境オブジェクト
 */
export const setupTestEnvironment = async (app: Express): Promise<TestEnvironment> => {
  // インメモリMongoDBの起動
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // データベース接続
  await mongoose.connect(uri);

  // モックルーターの設定
  console.log('テスト用APIルート登録開始...');
  
  // 重要: モックルーターを両方のパターンで登録する
  // 1. server.tsで登録される/api/productsパスのモック
  // 2. テスト用の直接/productsパスへのモック（フォールバック）
  try {
    // Expressアプリに直接モックルーターを登録（server.tsの/api/プレフィックスに関係なく動作）
    // server.tsではapp.use('/api', emptyRouter)が登録されているが、
    // ここでの登録が優先されるようにする
    app.use('/api/products', createMockProductRoutes());
    app.use('/api/categories', createMockCategoryRoutes());
    app.use('/api/payment', createMockPaymentRoutes());
    app.use('/api/auth', createMockAuthRoutes());
    
    // フォールバック用：/api/がないパターンも登録（APIClientMockとの互換性のため）
    app.use('/products', createMockProductRoutes());
    app.use('/categories', createMockCategoryRoutes());
    app.use('/payment', createMockPaymentRoutes());
    app.use('/auth', createMockAuthRoutes());
    
    // デバッグ用：登録されたルートを表示
    console.log('以下のルートが登録されました:');
    console.log(' - /api/products');
    console.log(' - /api/categories');
    console.log(' - /api/payment');
    console.log(' - /api/auth');
    console.log(' - /products (フォールバック)');
    console.log(' - /categories (フォールバック)');
    console.log(' - /payment (フォールバック)');
    console.log(' - /auth (フォールバック)');
  } catch (error) {
    console.error('ルーター登録中にエラーが発生しました:', error);
    throw error;
  }

  // APIクライアントモックの作成 (ルーター登録後に作成することが重要)
  const apiClient = new ApiClientMock(app);
  
  console.log('テスト用APIルート登録完了');

  return {
    apiClient,
    mongod,
  };
};

/**
 * 各テスト前の共通セットアップ
 */
export const commonBeforeEach = async (): Promise<void> => {
  await setupBeforeEach();
};

/**
 * 各テスト後の共通クリーンアップ
 */
export const commonAfterEach = async (): Promise<void> => {
  await teardownAfterEach();
};

/**
 * テスト管理者ユーザーの作成
 * @returns テスト管理者ユーザーのデータ
 */
export const createTestAdminUser = () => {
  return {
    email: 'admin@example.com',
    password: 'adminPassword123!',
    name: '管理者ユーザー',
    phoneNumber: '03-1234-5678',
    address: {
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      street: '大手町1-1-1',
      building: '管理ビル1F',
    },
    role: 'admin', // 管理者ロール
  };
};

/**
 * テストユーザーデータの作成
 * @returns テストユーザーのデータ
 */
export const createTestUser = () => {
  return {
    email: 'test@example.com',
    password: 'Password123!',
    name: 'テストユーザー',
    phoneNumber: '03-1234-5678',
    address: {
      postalCode: '123-4567',
      prefecture: '東京都',
      city: '千代田区',
      street: '丸の内1-1-1',
      building: 'サンプルビル101',
    },
    type: 'individual', // 個人
  };
};

/**
 * テスト企業ユーザーデータの作成
 * @returns テスト企業ユーザーのデータ
 */
export const createTestBusinessUser = () => {
  return {
    email: 'business@example.com',
    password: 'Password123!',
    name: '株式会社テスト',
    phoneNumber: '03-9876-5432',
    address: {
      postalCode: '123-4567',
      prefecture: '東京都',
      city: '新宿区',
      street: '新宿1-1-1',
      building: 'ビジネスビル10F',
    },
    type: 'business', // 法人
    businessProfile: {
      companyName: '株式会社テスト',
      departmentName: '資材部',
      representative: '山田太郎',
      corporateNumber: '1234567890123',
    },
  };
};

/**
 * テスト商品データの作成
 * @returns テスト商品データ
 */
export const createTestProduct = () => {
  return {
    name: 'テスト建設資材',
    description: 'これはテスト用の建設資材です。品質と耐久性に優れています。',
    price: 10000,
    referencePrice: 12000, // 参考価格（二重価格表示用）
    stockCount: 100,
    sku: 'TEST-SKU-001',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    category: '建材',
    manufacturer: 'テストメーカー',
    specifications: {
      weight: '5kg',
      dimensions: '100cm x 50cm x 10cm',
      material: 'アルミニウム',
    },
    isUsed: false, // 新品
  };
};

/**
 * テストカテゴリデータの作成
 * @returns テストカテゴリデータ
 */
export const createTestCategory = () => {
  return {
    name: 'テストカテゴリ',
    description: 'テスト用カテゴリです',
    slug: 'test-category',
    parentId: null, // 親カテゴリなし（トップレベル）
  };
};

/**
 * テスト注文データの作成
 * @param userId ユーザーID
 * @param productId 商品ID
 * @returns テスト注文データ
 */
export const createTestOrder = (userId: string, productId: string) => {
  return {
    userId,
    items: [
      {
        productId,
        quantity: 2,
        price: 10000, // 商品単価
      },
    ],
    totalAmount: 20000, // 合計金額
    shippingAddress: {
      postalCode: '123-4567',
      prefecture: '東京都',
      city: '千代田区',
      street: '丸の内1-1-1',
      building: 'サンプルビル101',
    },
    paymentMethod: 'credit_card',
    status: 'pending', // 注文ステータス（pending: 処理中）
  };
};

/**
 * データベースに直接管理者ユーザーを作成する関数
 * @param apiClient APIクライアントモック
 * @returns 作成された管理者ユーザーID
 */
export const seedAdminUser = async (apiClient: ApiClientMock): Promise<string> => {
  try {
    // 管理者ユーザーを登録API経由で作成
    const adminData = createTestAdminUser();
    const response = await apiClient.post<{ userId: string }>('/auth/register', adminData);
    
    // ユーザーモデルを直接取得して管理者権限を付与
    // この部分はアプリケーションの実装に依存するため、必要に応じて変更
    // 例えば直接MongoDBコレクションを操作する場合:
    /*
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(response.userId, { role: 'admin' });
    */
    
    return response.userId;
  } catch (error) {
    console.error('管理者ユーザー作成中にエラー:', error);
    throw error;
  }
}; 