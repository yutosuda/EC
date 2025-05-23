/**
 * 商品検索機能の連携テスト
 * フロントエンドとバックエンドの連携を検証
 */
import express, { Application } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import { ApiClientMock } from './mocks/apiClientMock';
import {
  setupTestEnvironment,
  commonBeforeEach,
  commonAfterEach,
  createTestProduct,
  createTestCategory,
} from './utils/testUtils';
import { APIError, ErrorCode, convertToAPIError } from './mocks/utilsMock';
import supertest from 'supertest';

// 環境変数の読み込み
dotenv.config();

// デバッグログ設定
const DEBUG = true;

// テスト用にモジュールをモック
jest.mock('../../src/backend/routes', () => ({
  apiRouter: express.Router()
}));

// APIエラーユーティリティをモック
jest.mock('../../src/backend/utils/error.util', () => {
  const { APIError, ErrorCode, convertToAPIError } = require('../integration/mocks/utilsMock');
  return {
    APIError,
    ErrorCode,
    convertToAPIError,
    createValidationError: (errors: Record<string, string>) => {
      return new APIError(ErrorCode.VALIDATION_ERROR, 'バリデーションエラー', { errors });
    },
    createAuthError: (message: string = '認証エラー') => {
      return new APIError(ErrorCode.UNAUTHORIZED, message);
    },
    createNotFoundError: (resource: string = 'リソース') => {
      return new APIError(ErrorCode.NOT_FOUND, `${resource}が見つかりません`);
    },
    createInternalError: (message: string = '内部エラー') => {
      return new APIError(ErrorCode.INTERNAL_ERROR, message);
    },
    errorStatusMap: {
      [ErrorCode.UNAUTHORIZED]: 401,
      [ErrorCode.FORBIDDEN]: 403,
      [ErrorCode.INVALID_TOKEN]: 401,
      [ErrorCode.TOKEN_EXPIRED]: 401,
      [ErrorCode.VALIDATION_ERROR]: 400,
      [ErrorCode.INVALID_INPUT]: 400,
      [ErrorCode.INVALID_ID]: 400,
      [ErrorCode.NOT_FOUND]: 404,
      [ErrorCode.ALREADY_EXISTS]: 409,
      [ErrorCode.CONFLICT]: 409,
      [ErrorCode.DB_ERROR]: 500,
      [ErrorCode.QUERY_FAILED]: 500,
      [ErrorCode.INTERNAL_ERROR]: 500,
      [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
      [ErrorCode.RATE_LIMIT_EXCEEDED]: 429
    }
  };
});

// エラーミドルウェアのモック
jest.mock('../../src/backend/middlewares/error.middleware', () => {
  const { APIError, convertToAPIError, ErrorCode } = require('../integration/mocks/utilsMock');
  
  // エラーハンドリングミドルウェア
  const errorHandler = (err: Error, req: any, res: any, next: any) => {
    // APIエラーを変換
    let apiError;
    
    if (err instanceof APIError) {
      apiError = err;
    } else {
      apiError = convertToAPIError(err);
    }
    
    res.status(apiError.statusCode || 500).json({
      success: false,
      error: {
        code: apiError.code || 'INTERNAL_ERROR',
        message: apiError.message || 'エラーが発生しました',
        details: apiError.details
      }
    });
  };
  
  // 404エラーハンドラー
  const notFoundHandler = (req: any, res: any) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'リクエストされたリソースが見つかりません',
        details: { path: req.originalUrl }
      }
    });
  };
  
  // 非同期ルートハンドラーのラッパー
  const asyncHandler = (fn: Function) => {
    return (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
  
  return {
    errorHandler,
    notFoundHandler,
    asyncHandler
  };
});

// Stripeモジュールをモック
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_test', client_secret: 'test_secret' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'pi_test', status: 'succeeded' })
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({ type: 'payment_intent.succeeded', data: { object: {} } })
    }
  }));
});

// 環境変数を設定
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';

// Expressアプリの読み込み（テスト用にデータベース設定を変更）
const getApp = () => {
  // server.tsからexpressアプリを取得（ただしlistenは呼ばない）
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';
  
  if (DEBUG) console.log('テスト用サーバーの初期化を開始...');
  
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: createApp } = require('../../src/backend/server');
  // テストモードでアプリを作成（APIルーターを自動ロードしない）
  const app = createApp({ isTest: true });
  
  if (DEBUG) console.log('テスト用サーバーの初期化が完了しました');
  
  process.env.NODE_ENV = originalEnv;
  return app;
};

describe('商品検索機能の連携テスト', () => {
  let apiClient: ApiClientMock;
  let mongod: MongoMemoryServer;
  let app: Application;

  // 全テスト開始前の共通セットアップ
  beforeAll(async () => {
    console.log('テスト環境のセットアップを開始します...');
    
    // Expressアプリの作成
    app = getApp();
    
    console.log('テスト環境を初期化します...');
    
    // テスト環境のセットアップ
    const env = await setupTestEnvironment(app);
    apiClient = env.apiClient;
    mongod = env.mongod;
    
    // デバッグモードの有効化
    apiClient.setDebug(DEBUG);
    
    console.log('テスト環境のセットアップが完了しました');
    
    // 登録されたルートをチェック（デバッグ用）
    if (DEBUG) {
      console.log('アプリのルートパスをチェックします...');
      try {
        const response = await supertest(app as any).get('/');
        console.log(`- ルートパス (/): ${response.status}`);
      } catch (error) {
        console.error('- ルートパス (/): 失敗', error);
      }

      try {
        const res = await supertest(app as any).get('/api/products');
        console.log(`- 商品API (/api/products): ${res.status}`);
        if (res.status !== 200) {
          console.log('  レスポンス:', res.body);
        }
      } catch (error) {
        console.error('- 商品API (/api/products): 失敗', error);
      }
    }
  });

  // 全テスト終了後のクリーンアップ
  afterAll(async () => {
    console.log('テスト環境のクリーンアップを開始します...');
    
    // データベース接続を閉じる
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('- データベース接続を閉じました');
    }
    
    // インメモリMongoDBの停止
    if (mongod) {
      await mongod.stop();
      console.log('- インメモリMongoDBを停止しました');
    }
    
    console.log('テスト環境のクリーンアップが完了しました');
  });

  // 各テスト前の共通セットアップ
  beforeEach(async () => {
    if (DEBUG) console.log('テスト前の準備を開始します...');
    await commonBeforeEach();
    if (DEBUG) console.log('テスト前の準備が完了しました');
  });

  // 各テスト後の共通クリーンアップ
  afterEach(async () => {
    if (DEBUG) console.log('テスト後のクリーンアップを開始します...');
    await commonAfterEach();
    if (DEBUG) console.log('テスト後のクリーンアップが完了しました');
  });

  /**
   * 商品検索機能の基本テスト
   */
  test('商品の基本検索機能のテスト', async () => {
    console.log('商品の基本検索機能のテストを開始します...');
    
    // フロントエンドから商品を検索
    const searchResults = await apiClient.get<{ items: any[]; total: number }>('/products', {
      keyword: 'テスト建設',
    });
    
    expect(Array.isArray(searchResults.items)).toBe(true);
    expect(searchResults.items.length).toBeGreaterThanOrEqual(1);
    // モック検索結果を確認
    expect(searchResults.items.some(item => item.name === 'テスト建設資材')).toBe(true);

    // カテゴリでの絞り込み
    const categoryResults = await apiClient.get<{ items: any[]; total: number }>('/products', {
      category: 'category-123',
    });
    
    expect(Array.isArray(categoryResults.items)).toBe(true);
    expect(categoryResults.items.length).toBeGreaterThanOrEqual(1);
    
    // 価格での絞り込み
    const priceResults = await apiClient.get<{ items: any[]; total: number }>('/products', {
      minPrice: '9000',
      maxPrice: '11000',
    });
    
    expect(Array.isArray(priceResults.items)).toBe(true);
    
    // 存在しない商品の検索
    const noResults = await apiClient.get<{ items: any[]; total: number }>('/products', {
      keyword: '存在しない商品名XXXXXXX',
    });
    
    expect(Array.isArray(noResults.items)).toBe(true);
    expect(noResults.items.length).toBe(0);
    
    // SKUでの検索
    const skuResults = await apiClient.get<{ items: any[]; total: number }>('/products', {
      sku: 'TEST-SKU-001',
    });
    
    expect(Array.isArray(skuResults.items)).toBe(true);
    expect(skuResults.items.length).toBeGreaterThanOrEqual(1);
    
    console.log('商品の基本検索機能のテストが完了しました');
  });
  
  /**
   * 商品のソート機能テスト
   */
  test('商品検索のソート機能のテスト', async () => {
    console.log('商品検索のソート機能のテストを開始します...');
    
    // 価格の昇順でソート
    const ascResults = await apiClient.get<{ items: any[] }>('/products', {
      sort: 'price',
      order: 'asc',
    });
    
    expect(Array.isArray(ascResults.items)).toBe(true);
    if (ascResults.items.length >= 2) {
      // 価格の昇順になっていることを確認
      for (let i = 1; i < ascResults.items.length; i++) {
        expect(ascResults.items[i].price).toBeGreaterThanOrEqual(ascResults.items[i-1].price);
      }
    }
    
    // 価格の降順でソート
    const descResults = await apiClient.get<{ items: any[] }>('/products', {
      sort: 'price',
      order: 'desc',
    });
    
    expect(Array.isArray(descResults.items)).toBe(true);
    if (descResults.items.length >= 2) {
      // 価格の降順になっていることを確認
      for (let i = 1; i < descResults.items.length; i++) {
        expect(descResults.items[i].price).toBeLessThanOrEqual(descResults.items[i-1].price);
      }
    }
    
    console.log('商品検索のソート機能のテストが完了しました');
  });
}); 