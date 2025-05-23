/**
 * 商品検索機能の単純化された統合テスト
 * フロントエンドとバックエンドの連携を検証（より単純なセットアップで）
 */
import express from 'express';
import request from 'supertest';
import { createMockProductRoutes } from './mocks/routesMock';

describe('商品検索ルーターテスト（分離）', () => {
  let app: express.Application;

  // 各テスト前の共通セットアップ
  beforeEach(() => {
    // Expressアプリ作成
    app = express();
    
    // JSONミドルウェア
    app.use(express.json());
    
    // 商品ルート登録
    app.use('/api/products', createMockProductRoutes());
  });

  test('商品検索とフィルタリング', async () => {
    // キーワード検索
    const response = await request(app)
      .get('/api/products')
      .query({ keyword: 'テスト' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.some((item: any) => item.name.includes('テスト'))).toBe(true);
  });

  test('商品ソート', async () => {
    // 価格の昇順でソート
    const response = await request(app)
      .get('/api/products')
      .query({ sort: 'price', order: 'asc' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    
    // 価格の昇順になっていることを確認
    const items = response.body.items;
    if (items.length >= 2) {
      for (let i = 1; i < items.length; i++) {
        expect(items[i].price).toBeGreaterThanOrEqual(items[i-1].price);
      }
    }
  });

  test('商品作成', async () => {
    // 新商品の作成
    const newProduct = {
      name: 'テスト新商品',
      price: 12000,
      category: 'category-123',
      sku: 'TEST-SKU-999'
    };
    
    const response = await request(app)
      .post('/api/products')
      .send(newProduct);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(newProduct.name);
    expect(response.body.price).toBe(newProduct.price);
  });
}); 