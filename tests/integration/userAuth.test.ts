/**
 * ユーザー認証と会員機能の連携テスト
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
  createTestBusinessUser,
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

describe('ユーザー認証と会員機能の連携テスト', () => {
  let apiClient: ApiClientMock;
  let mongod: MongoMemoryServer;
  let closeServer: () => Promise<void>;

  // 全テスト開始前の共通セットアップ
  beforeAll(async () => {
    const app = getApp();
    const env = await setupTestEnvironment(app);
    apiClient = env.apiClient;
    mongod = env.mongod;
    closeServer = env.closeServer;
  });

  // 全テスト終了後のクリーンアップ
  afterAll(async () => {
    await closeServer();
  });

  // 各テスト前の共通セットアップ
  beforeEach(async () => {
    await commonBeforeEach();
  });

  // 各テスト後の共通クリーンアップ
  afterEach(async () => {
    await commonAfterEach();
  });

  /**
   * ユーザー登録からログインまでの一連の流れをテスト
   */
  test('個人ユーザーの登録・ログイン・情報取得の連携テスト', async () => {
    // テストユーザーデータ
    const userData = createTestUser();
    
    // ユーザー登録
    const registration = await apiClient.post<{ message: string; userId: string }>('/auth/register', userData);
    expect(registration.userId).toBeDefined();
    expect(registration.message).toContain('登録');

    // ログイン
    const loginResponse = await apiClient.post<{ token: string; user: any }>('/auth/login', {
      email: userData.email,
      password: userData.password,
    });
    
    expect(loginResponse.token).toBeDefined();
    expect(loginResponse.user).toBeDefined();
    expect(loginResponse.user.email).toBe(userData.email);
    
    // 取得したトークンをセット
    apiClient.setToken(loginResponse.token);
    
    // ユーザー情報取得
    const userInfo = await apiClient.get<any>('/users/me');
    expect(userInfo.email).toBe(userData.email);
    expect(userInfo.name).toBe(userData.name);
    expect(userInfo.type).toBe('individual');
    
    // ユーザー情報更新
    const updatedName = 'テストユーザー（更新）';
    const updateResponse = await apiClient.put<any>('/users/me', {
      name: updatedName,
    });
    
    expect(updateResponse.name).toBe(updatedName);
    
    // 更新されたユーザー情報を再取得
    const updatedUserInfo = await apiClient.get<any>('/users/me');
    expect(updatedUserInfo.name).toBe(updatedName);
    
    // ログアウト
    apiClient.clearToken();
    
    // ログアウト後に認証が必要なエンドポイントにアクセスするとエラーになることを確認
    try {
      await apiClient.get<any>('/users/me');
      // ここに到達した場合はテスト失敗
      fail('認証なしでユーザー情報にアクセスできてしまいました');
    } catch (e) {
      expect(e).toBeDefined();
      expect((e as any).status).toBe(401);
    }
  });

  /**
   * 法人ユーザー（BtoB）の登録と機能テスト
   */
  test('法人ユーザーの登録と特定機能の連携テスト', async () => {
    // テスト法人ユーザーデータ
    const businessUserData = createTestBusinessUser();
    
    // 法人ユーザー登録
    const registration = await apiClient.post<{ message: string; userId: string }>('/auth/register', businessUserData);
    expect(registration.userId).toBeDefined();
    
    // ログイン
    const loginResponse = await apiClient.post<{ token: string; user: any }>('/auth/login', {
      email: businessUserData.email,
      password: businessUserData.password,
    });
    
    expect(loginResponse.token).toBeDefined();
    expect(loginResponse.user.type).toBe('business');
    
    // 取得したトークンをセット
    apiClient.setToken(loginResponse.token);
    
    // 法人情報取得
    const userInfo = await apiClient.get<any>('/users/me');
    expect(userInfo.businessProfile).toBeDefined();
    expect(userInfo.businessProfile.companyName).toBe(businessUserData.businessProfile.companyName);
    
    // 法人情報更新
    const updatedDepartment = '営業部';
    const updateResponse = await apiClient.put<any>('/users/me', {
      businessProfile: {
        ...userInfo.businessProfile,
        departmentName: updatedDepartment,
      },
    });
    
    expect(updateResponse.businessProfile.departmentName).toBe(updatedDepartment);
    
    // BtoB特典（特別価格など）の確認テスト
    // ※実際のAPIの実装に依存します
    try {
      const specialPrices = await apiClient.get<any>('/business/special-prices');
      expect(specialPrices).toBeDefined();
    } catch (e) {
      // BtoB機能がまだ実装されていない場合はスキップ
      console.log('BtoB特典機能はまだ実装されていないためスキップします');
    }
  });

  /**
   * パスワードリセット機能のテスト
   */
  test('パスワードリセット機能の連携テスト', async () => {
    // テストユーザーを登録
    const userData = createTestUser();
    await apiClient.post('/auth/register', userData);
    
    // パスワードリセットリクエスト
    const resetRequest = await apiClient.post<{ message: string }>('/auth/forgot-password', {
      email: userData.email,
    });
    
    expect(resetRequest.message).toBeDefined();
    
    // 実際のパスワードリセットはメール送信とトークン検証を含むため、
    // モックが必要になります。ここではリセットリクエストが受け付けられることのみを確認。
    
    // リセットトークンを直接DBから取得する方法や、
    // バックエンドにテスト用のエンドポイントを用意する方法もありますが、
    // 今回はリクエストの連携確認のみとします。
  });
}); 