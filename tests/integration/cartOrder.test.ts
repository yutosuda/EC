/**
 * カート機能と注文処理の連携テスト
 * フロントエンドとバックエンドの連携を検証
 */
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import { ApiClientMock } from './mocks/apiClientMock';
import {
  setupTestEnvironment,
  commonBeforeEach,
  commonAfterEach,
  createTestUser,
  createTestProduct,
  createTestCategory,
} from './utils/testUtils';

// 環境変数の読み込み
dotenv.config();

// Expressアプリの読み込み（テスト用にデータベース設定を変更）
const getApp = () => {
  // server.tsからexpressアプリを取得（ただしlistenは呼ばない）
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: createApp } = require('../src/backend/server');
  const app = createApp();
  process.env.NODE_ENV = originalEnv;
  return app;
};

describe('カート機能と注文処理の連携テスト', () => {
  let apiClient: ApiClientMock;
  let mongod: MongoMemoryServer;
  let closeServer: () => Promise<void>;
  let productId: string;
  let userId: string;
  let app: express.Application;

  // 全テスト開始前の共通セットアップ
  beforeAll(async () => {
    // テスト環境のセットアップ
    const env = await setupTestEnvironment();
    app = env.app;
    closeServer = env.closeServer;
    apiClient = env.apiClient;
    mongod = env.mongod;
  });

  // 全テスト終了後のクリーンアップ
  afterAll(async () => {
    // テスト環境のクリーンアップ
    if (closeServer) {
      await closeServer();
    }
  });

  // 各テスト前の共通セットアップと必要なデータ作成
  beforeEach(async () => {
    await commonBeforeEach();
    
    // 管理者ユーザーでログイン
    const adminLoginResponse = await apiClient.post<{ token: string }>('/auth/login', {
      email: 'admin@example.com',
      password: 'adminPassword',
    });
    
    apiClient.setToken(adminLoginResponse.token);
    
    // テストカテゴリ作成
    const categoryData = createTestCategory();
    const category = await apiClient.post<{ id: string }>('/categories', categoryData);
    
    // テスト商品作成
    const productData = createTestProduct();
    productData.category = category.id;
    const product = await apiClient.post<{ id: string }>('/products', productData);
    productId = product.id;
    
    // 一般ユーザー登録
    apiClient.clearToken(); // 一旦管理者トークンをクリア
    const userData = createTestUser();
    const registration = await apiClient.post<{ userId: string }>('/auth/register', userData);
    userId = registration.userId;
    
    // 一般ユーザーでログイン
    const loginResponse = await apiClient.post<{ token: string }>('/auth/login', {
      email: userData.email,
      password: userData.password,
    });
    
    apiClient.setToken(loginResponse.token);
  });

  // 各テスト後の共通クリーンアップ
  afterEach(async () => {
    await commonAfterEach();
  });

  /**
   * カートへの商品追加から注文完了までのフロー
   */
  test('カートフローと注文処理の連携テスト', async () => {
    // カートに商品を追加
    const addToCartResponse = await apiClient.post<{ cartId: string }>('/cart/items', {
      productId,
      quantity: 2,
    });
    
    expect(addToCartResponse.cartId).toBeDefined();
    
    // カート内容の確認
    const cartResponse = await apiClient.get<{
      items: Array<{ productId: string; quantity: number; price: number }>;
      totalAmount: number;
    }>('/cart');
    
    expect(cartResponse.items).toBeDefined();
    expect(cartResponse.items.length).toBe(1);
    expect(cartResponse.items[0].productId).toBe(productId);
    expect(cartResponse.items[0].quantity).toBe(2);
    expect(cartResponse.totalAmount).toBeDefined();
    
    // カート内の商品数量を更新
    const updateCartResponse = await apiClient.put<{ success: boolean }>('/cart/items', {
      productId,
      quantity: 3,
    });
    
    expect(updateCartResponse.success).toBe(true);
    
    // 更新後のカート内容を確認
    const updatedCartResponse = await apiClient.get<{
      items: Array<{ productId: string; quantity: number }>;
    }>('/cart');
    
    expect(updatedCartResponse.items[0].quantity).toBe(3);
    
    // 注文処理
    const orderResponse = await apiClient.post<{ orderId: string }>('/orders', {
      shippingAddress: {
        postalCode: '123-4567',
        prefecture: '東京都',
        city: '千代田区',
        street: '丸の内1-1-1',
        building: 'サンプルビル101',
      },
      paymentMethod: 'credit_card',
      paymentDetails: {
        // 決済代行サービスのテストモードを想定したデータ
        cardToken: 'test_card_token',
      },
      // 承諾事項（必要な場合）
      agreements: {
        termsOfService: true,
        privacyPolicy: true,
        specialConditions: true,
      },
    });
    
    expect(orderResponse.orderId).toBeDefined();
    
    // 注文詳細の確認
    const orderDetailsResponse = await apiClient.get<{
      id: string;
      status: string;
      items: Array<{ productId: string; quantity: number; price: number }>;
      totalAmount: number;
    }>(`/orders/${orderResponse.orderId}`);
    
    expect(orderDetailsResponse.id).toBe(orderResponse.orderId);
    expect(orderDetailsResponse.status).toBeDefined();
    expect(orderDetailsResponse.items.length).toBe(1);
    expect(orderDetailsResponse.items[0].productId).toBe(productId);
    expect(orderDetailsResponse.items[0].quantity).toBe(3);
    expect(orderDetailsResponse.totalAmount).toBeGreaterThan(0);
    
    // カートが空になっていることを確認
    const emptyCartResponse = await apiClient.get<{ items: any[] }>('/cart');
    expect(emptyCartResponse.items.length).toBe(0);
    
    // 注文履歴の確認
    const orderHistoryResponse = await apiClient.get<{ orders: any[] }>('/orders');
    expect(orderHistoryResponse.orders.length).toBeGreaterThan(0);
    expect(orderHistoryResponse.orders.some(order => order.id === orderResponse.orderId)).toBe(true);
  });

  /**
   * カートからの商品削除機能
   */
  test('カートからの商品削除の連携テスト', async () => {
    // カートに商品を追加
    await apiClient.post('/cart/items', {
      productId,
      quantity: 1,
    });
    
    // カート内容の確認
    const cartBeforeDelete = await apiClient.get<{ items: any[] }>('/cart');
    expect(cartBeforeDelete.items.length).toBe(1);
    
    // カートから商品を削除
    const deleteResponse = await apiClient.delete<{ success: boolean }>(`/cart/items/${productId}`);
    expect(deleteResponse.success).toBe(true);
    
    // 削除後のカート内容を確認
    const cartAfterDelete = await apiClient.get<{ items: any[] }>('/cart');
    expect(cartAfterDelete.items.length).toBe(0);
  });

  /**
   * 未ログインユーザーのカート機能
   */
  test('未ログインユーザーのカート機能の連携テスト', async () => {
    // ログアウト状態に
    apiClient.clearToken();
    
    // 匿名カートの作成（カートに商品を追加）
    const anonymousCartResponse = await apiClient.post<{ cartId: string; sessionId: string }>('/cart/anonymous/items', {
      productId,
      quantity: 1,
      sessionId: 'test-session-id', // フロントエンドで生成するセッションID
    });
    
    expect(anonymousCartResponse.cartId).toBeDefined();
    expect(anonymousCartResponse.sessionId).toBeDefined();
    
    // セッションIDを使って匿名カートの内容を取得
    const anonymousCartContent = await apiClient.get<{ items: any[] }>('/cart/anonymous', {
      sessionId: anonymousCartResponse.sessionId,
    });
    
    expect(anonymousCartContent.items.length).toBe(1);
    expect(anonymousCartContent.items[0].productId).toBe(productId);
    
    // ※ここでログインすると未ログイン時のカートがマージされるという機能もあるが、
    // その実装はAPIの詳細に依存するため、ここではテストしない
  });
}); 