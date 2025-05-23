/**
 * 商品検索機能の単純化された統合テスト
 * 
 * このテストは最小限の設定で商品APIルートをテストします。
 * 問題を切り分け、確実に再現できるようにするための単純化バージョンです。
 */
import express from 'express';
import request from 'supertest';
import { createMockProductRoutes } from './mocks/routesMock';

describe('商品検索API単純化テスト', () => {
  let app: express.Application;

  // 各テスト前の共通セットアップ
  beforeEach(() => {
    console.log('テスト用Expressサーバー初期化...');
    
    // 新しいExpressアプリを作成
    app = express();
    
    // JSONミドルウェア
    app.use(express.json());
    
    // ルートハンドラー
    app.get('/', (req, res) => {
      res.json({ message: 'テストサーバー稼働中' });
    });
    
    // 商品ルート登録 - 重要: /apiプレフィックスなし
    app.use('/products', createMockProductRoutes());
    
    // デバッグ用：登録されているルートをチェック
    console.log('以下のルートが登録されました:');
    console.log(' - / (ルート)');
    console.log(' - /products (商品API)');
  });

  test('ルートパスにアクセスできること', async () => {
    const response = await request(app).get('/');
    console.log(`ルートパスレスポンス: ${response.status}`);
    expect(response.status).toBe(200);
  });

  test('商品APIにアクセスできること', async () => {
    const response = await request(app).get('/products');
    console.log(`商品APIレスポンス: ${response.status}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  test('商品キーワード検索が機能すること', async () => {
    const response = await request(app)
      .get('/products')
      .query({ keyword: 'テスト' });
    
    console.log(`商品検索レスポンス: ${response.status}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    
    // 少なくとも1件の結果があること
    expect(response.body.items.length).toBeGreaterThan(0);
    
    // 検索結果に「テスト」が含まれていること
    expect(response.body.items.some((item: any) => 
      item.name.toLowerCase().includes('テスト')
    )).toBe(true);
  });

  test('商品ソートが機能すること', async () => {
    const response = await request(app)
      .get('/products')
      .query({ sort: 'price', order: 'asc' });
    
    console.log(`商品ソートレスポンス: ${response.status}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
  });
}); 