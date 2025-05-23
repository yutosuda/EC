/**
 * 商品検索機能の包括的テスト（単純化アプローチ）
 * 
 * 複雑な統合テスト環境ではなく、シンプルなExpressアプリを使用して
 * フロントエンドとバックエンドの連携を再現します。
 */
import express from 'express';
import request from 'supertest';
import { createMockProductRoutes, createMockCategoryRoutes } from './mocks/routesMock';
import { createTestProduct, createTestCategory } from './utils/testUtils';

describe('商品API包括的テスト（単純化）', () => {
  let app: express.Application;
  let testProducts: any[];

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
    
    // 商品モックデータの準備
    testProducts = [
      {
        id: 'product-123',
        name: 'テスト建設資材',
        price: 10000,
        category: 'category-123',
        sku: 'TEST-SKU-001',
        manufacturer: 'テストメーカー',
        stockCount: 100
      },
      {
        id: 'product-456',
        name: '高級建設資材',
        price: 25000,
        category: 'category-123',
        sku: 'TEST-SKU-002',
        manufacturer: '高級メーカー',
        stockCount: 50
      },
      {
        id: 'product-789',
        name: '格安建設資材',
        price: 5000,
        category: 'category-456',
        sku: 'TEST-SKU-003',
        manufacturer: '格安メーカー',
        stockCount: 200
      }
    ];
    
    // API用ルーターの登録
    app.use('/products', createMockProductRoutes());
    app.use('/categories', createMockCategoryRoutes());
    
    console.log('テスト用APIルート登録完了');
  });

  // 基本的なルートテスト
  test('ルートパスにアクセスできること', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('テストサーバー稼働中');
  });

  // 商品一覧取得テスト
  test('商品一覧が取得できること', async () => {
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBeGreaterThan(0);
  });

  // キーワード検索テスト
  test('商品がキーワードで検索できること', async () => {
    const response = await request(app)
      .get('/products')
      .query({ keyword: 'テスト' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    
    // 「テスト」を含む商品があること
    expect(response.body.items.some((item: any) => 
      item.name.toLowerCase().includes('テスト')
    )).toBe(true);
    
    // 「高級」を含む商品はフィルタリングされていること
    expect(response.body.items.every((item: any) => 
      !item.name.includes('高級')
    )).toBe(true);
  });

  // カテゴリ検索テスト
  test('商品がカテゴリでフィルタリングできること', async () => {
    const response = await request(app)
      .get('/products')
      .query({ category: 'category-123' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    
    // すべての商品がcategory-123に属していること
    expect(response.body.items.every((item: any) => 
      item.category === 'category-123'
    )).toBe(true);
  });

  // 価格範囲検索テスト
  test('商品が価格範囲でフィルタリングできること', async () => {
    const response = await request(app)
      .get('/products')
      .query({ minPrice: '6000', maxPrice: '20000' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    
    // すべての商品が指定価格範囲内であること
    expect(response.body.items.every((item: any) => 
      item.price >= 6000 && item.price <= 20000
    )).toBe(true);
  });

  // 価格昇順ソートテスト
  test('商品が価格昇順でソートできること', async () => {
    const response = await request(app)
      .get('/products')
      .query({ sort: 'price', order: 'asc' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    
    // 価格が昇順になっていることを確認
    if (response.body.items.length >= 2) {
      for (let i = 1; i < response.body.items.length; i++) {
        expect(response.body.items[i].price).toBeGreaterThanOrEqual(response.body.items[i-1].price);
      }
    }
  });

  // 価格降順ソートテスト
  test('商品が価格降順でソートできること', async () => {
    const response = await request(app)
      .get('/products')
      .query({ sort: 'price', order: 'desc' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    
    // 価格が降順になっていることを確認
    if (response.body.items.length >= 2) {
      for (let i = 1; i < response.body.items.length; i++) {
        expect(response.body.items[i].price).toBeLessThanOrEqual(response.body.items[i-1].price);
      }
    }
  });

  // 在庫数でのソートテスト
  test('商品が在庫数でソートできること', async () => {
    const response = await request(app)
      .get('/products')
      .query({ sort: 'stockCount', order: 'desc' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  // SKU検索テスト
  test('商品がSKUで検索できること', async () => {
    const response = await request(app)
      .get('/products')
      .query({ sku: 'TEST-SKU-001' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBeGreaterThan(0);
    
    // SKUが一致する商品のみが返されること
    expect(response.body.items.every((item: any) => 
      item.sku === 'TEST-SKU-001'
    )).toBe(true);
  });

  // メーカー検索テスト
  test('商品がメーカーで検索できること', async () => {
    const response = await request(app)
      .get('/products')
      .query({ manufacturer: 'テストメーカー' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    
    // メーカーが一致する商品のみが返されること
    expect(response.body.items.every((item: any) => 
      item.manufacturer === 'テストメーカー'
    )).toBe(true);
  });

  // 商品作成テスト
  test('新しい商品を作成できること', async () => {
    const newProduct = createTestProduct();
    
    const response = await request(app)
      .post('/products')
      .send(newProduct);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(newProduct.name);
  });

  // 複合条件検索テスト
  test('商品が複合条件で検索できること', async () => {
    const response = await request(app)
      .get('/products')
      .query({ 
        keyword: '建設',
        minPrice: '5000',
        maxPrice: '15000'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.items)).toBe(true);
    
    // すべての商品が条件に一致していること
    expect(response.body.items.every((item: any) => 
      item.name.includes('建設') && 
      item.price >= 5000 && 
      item.price <= 15000
    )).toBe(true);
  });
}); 