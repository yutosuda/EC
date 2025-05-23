import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import { Product, Category, User } from '../models';
import { productRoutes } from '../routes/product.routes';
import { authRoutes } from '../routes/auth.routes';
import { errorHandler } from '../middlewares/error.middleware';
import dotenv from 'dotenv';

dotenv.config();

// テスト用の Express アプリ
const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use(errorHandler);

// テスト用データ
let testProductId: string;
let adminToken: string;
let userToken: string;

// MongoDB に接続し、テスト前に必要なデータをセットアップ
beforeAll(async () => {
  // テスト用 MongoDB に接続
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/construction-ec-test?authSource=admin';
  await mongoose.connect(MONGODB_URI);
  
  // テスト用データをクリーンアップ
  await User.deleteMany({ email: /^test/ });
  await Category.deleteMany({ name: /^テストカテゴリ/ });
  await Product.deleteMany({ name: /^テスト商品/ });
  
  // テスト用の管理者ユーザーを作成
  const adminUser = new User({
    email: 'test-admin@example.com',
    password: 'Password123',
    firstName: '管理者',
    lastName: 'テスト',
    role: 'admin',
  });
  await adminUser.save();
  
  // テスト用の一般ユーザーを作成
  const normalUser = new User({
    email: 'test-user@example.com',
    password: 'Password123',
    firstName: '一般',
    lastName: 'ユーザー',
    role: 'user',
  });
  await normalUser.save();
  
  // テスト用のカテゴリを作成
  const category = new Category({
    name: 'テストカテゴリ',
    description: 'テスト用カテゴリ',
    slug: 'test-category',
    isActive: true,
  });
  const savedCategory = await category.save();
  
  // テスト用の商品を作成
  const product = new Product({
    name: 'テスト商品',
    description: 'テスト用商品の説明',
    price: 1000,
    comparePrice: 1500,
    sku: 'TEST-SKU-001',
    images: ['test-image.jpg'],
    mainImage: 'test-image.jpg',
    category: savedCategory._id,
    stock: 100,
    isVisible: true,
  });
  const savedProduct = await product.save();
  testProductId = savedProduct._id.toString();
  
  // ログイントークンを取得
  const adminLoginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test-admin@example.com', password: 'Password123' });
  adminToken = adminLoginResponse.body.token;
  
  const userLoginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test-user@example.com', password: 'Password123' });
  userToken = userLoginResponse.body.token;
});

// テスト終了後にデータベース接続を閉じる
afterAll(async () => {
  await mongoose.connection.close();
});

describe('商品API統合テスト', () => {
  // 商品一覧の取得をテスト
  test('商品一覧を取得できること', async () => {
    const response = await request(app).get('/api/products');
    
    expect(response.status).toBe(200);
    expect(response.body.products).toBeDefined();
    expect(Array.isArray(response.body.products)).toBe(true);
    expect(response.body.products.length).toBeGreaterThan(0);
    expect(response.body.totalCount).toBeDefined();
  });
  
  // 商品詳細の取得をテスト
  test('商品詳細を取得できること', async () => {
    const response = await request(app).get(`/api/products/${testProductId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.product).toBeDefined();
    expect(response.body.product.name).toBe('テスト商品');
    expect(response.body.product.price).toBe(1000);
  });
  
  // 商品の作成をテスト（管理者のみ）
  test('管理者が商品を作成できること', async () => {
    const categoryResponse = await request(app).get('/api/categories');
    const categoryId = categoryResponse.body.categories[0]._id;
    
    const newProduct = {
      name: 'テスト商品2',
      description: '新しいテスト商品',
      price: 2000,
      comparePrice: 2500,
      sku: 'TEST-SKU-002',
      images: ['test-image2.jpg'],
      mainImage: 'test-image2.jpg',
      category: categoryId,
      stock: 50,
      isVisible: true,
    };
    
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProduct);
    
    expect(response.status).toBe(201);
    expect(response.body.product).toBeDefined();
    expect(response.body.product.name).toBe('テスト商品2');
    expect(response.body.product.price).toBe(2000);
    
    // 作成された商品が取得できることを確認
    const getResponse = await request(app).get(`/api/products/${response.body.product._id}`);
    expect(getResponse.status).toBe(200);
  });
  
  // 一般ユーザーは商品を作成できないことをテスト
  test('一般ユーザーは商品を作成できないこと', async () => {
    const categoryResponse = await request(app).get('/api/categories');
    const categoryId = categoryResponse.body.categories[0]._id;
    
    const newProduct = {
      name: 'テスト商品3',
      description: '一般ユーザーが作成しようとした商品',
      price: 3000,
      comparePrice: 3500,
      sku: 'TEST-SKU-003',
      images: ['test-image3.jpg'],
      mainImage: 'test-image3.jpg',
      category: categoryId,
      stock: 30,
      isVisible: true,
    };
    
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newProduct);
    
    expect(response.status).toBe(403); // Forbidden
  });
  
  // 商品の更新をテスト（管理者のみ）
  test('管理者が商品を更新できること', async () => {
    const updateData = {
      name: 'テスト商品（更新）',
      price: 1200,
    };
    
    const response = await request(app)
      .put(`/api/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);
    
    expect(response.status).toBe(200);
    expect(response.body.product).toBeDefined();
    expect(response.body.product.name).toBe('テスト商品（更新）');
    expect(response.body.product.price).toBe(1200);
    
    // 更新された商品が取得できることを確認
    const getResponse = await request(app).get(`/api/products/${testProductId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.product.name).toBe('テスト商品（更新）');
  });
  
  // 商品の検索をテスト
  test('商品を検索できること', async () => {
    const response = await request(app).get('/api/products/search?keyword=テスト');
    
    expect(response.status).toBe(200);
    expect(response.body.products).toBeDefined();
    expect(Array.isArray(response.body.products)).toBe(true);
    expect(response.body.products.length).toBeGreaterThan(0);
  });
  
  // カテゴリーによる商品フィルタリングをテスト
  test('カテゴリーで商品をフィルタリングできること', async () => {
    const categoryResponse = await request(app).get('/api/categories');
    const categoryId = categoryResponse.body.categories[0]._id;
    
    const response = await request(app).get(`/api/products/category/${categoryId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.products).toBeDefined();
    expect(Array.isArray(response.body.products)).toBe(true);
    expect(response.body.products.length).toBeGreaterThan(0);
  });
});

describe('認証API統合テスト', () => {
  // ユーザー登録をテスト
  test('新規ユーザーを登録できること', async () => {
    const newUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'Password123',
      firstName: '新規',
      lastName: 'ユーザー',
      phoneNumber: '090-1234-5678',
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);
    
    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(newUser.email);
  });
  
  // ログインをテスト
  test('有効な資格情報でログインできること', async () => {
    const credentials = {
      email: 'test-user@example.com',
      password: 'Password123',
    };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials);
    
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(credentials.email);
  });
  
  // 無効なパスワードでのログイン失敗をテスト
  test('無効なパスワードでログインできないこと', async () => {
    const credentials = {
      email: 'test-user@example.com',
      password: 'WrongPassword',
    };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials);
    
    expect(response.status).toBe(401);
  });
}); 