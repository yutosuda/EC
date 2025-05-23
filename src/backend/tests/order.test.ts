import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import { Order, User, Product, Category, OrderStatus } from '../models';
import { orderRoutes } from '../routes/order.routes';
import { errorHandler } from '../middlewares/error.middleware';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// テスト用の Express アプリ
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: 'test-user-id',
    email: 'test@example.com',
    role: 'user'
  };
  next();
});
app.use('/api/orders', orderRoutes);
app.use(errorHandler);

// テスト用データ
let testOrderId: string;
let testProductId: string;
let testUserId: string;
let adminUserId: string;
let userToken: string;
let adminToken: string;

// MongoDB に接続し、テスト前に必要なデータをセットアップ
beforeAll(async () => {
  // テスト用 MongoDB に接続
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/construction-ec-test?authSource=admin';
  await mongoose.connect(MONGODB_URI);
  
  // テスト用データをクリーンアップ
  await User.deleteMany({ email: /^order-test/ });
  await Order.deleteMany({});
  
  // テスト用カテゴリを作成
  const category = new Category({
    name: 'テストカテゴリ',
    slug: 'test-category',
    isActive: true,
  });
  const savedCategory = await category.save();
  
  // テスト用商品を作成
  const product = new Product({
    name: 'テスト商品',
    description: 'テスト用商品の説明',
    price: 1000,
    sku: 'TEST-SKU-001',
    category: savedCategory._id,
    stock: 100,
    isVisible: true,
  });
  const savedProduct = await product.save();
  testProductId = savedProduct._id.toString();
  
  // テスト用ユーザーを作成
  const user = new User({
    email: 'order-test-user@example.com',
    password: 'Password123',
    firstName: '注文',
    lastName: 'ユーザー',
    role: 'user',
  });
  const savedUser = await user.save();
  testUserId = savedUser._id.toString();
  
  // テスト用管理者ユーザーを作成
  const adminUser = new User({
    email: 'order-test-admin@example.com',
    password: 'Password123',
    firstName: '管理者',
    lastName: 'テスト',
    role: 'admin',
  });
  const savedAdminUser = await adminUser.save();
  adminUserId = savedAdminUser._id.toString();
  
  // テスト用注文を作成
  const order = new Order({
    user: testUserId,
    orderNumber: `TEST-${Date.now()}`,
    status: OrderStatus.PENDING,
    items: [
      {
        product: testProductId,
        quantity: 2,
        price: 1000,
        name: 'テスト商品',
      }
    ],
    shippingAddress: {
      postalCode: '123-4567',
      prefecture: '東京都',
      city: '千代田区',
      address1: '丸の内1-1-1',
      phoneNumber: '03-1234-5678',
    },
    paymentMethod: 'credit_card',
    subtotal: 2000,
    tax: 200,
    shippingFee: 500,
    totalAmount: 2700,
  });
  const savedOrder = await order.save();
  testOrderId = savedOrder._id.toString();
  
  // JWTトークンを生成
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  userToken = jwt.sign(
    { id: testUserId, email: savedUser.email, role: savedUser.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  adminToken = jwt.sign(
    { id: adminUserId, email: savedAdminUser.email, role: savedAdminUser.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
});

// テスト終了後にデータベース接続を閉じる
afterAll(async () => {
  await mongoose.connection.close();
});

describe('注文API統合テスト', () => {
  // 注文一覧取得テスト（ユーザー）
  test('ユーザーが自分の注文一覧を取得できること', async () => {
    const response = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.orders)).toBe(true);
    expect(response.body.orders.length).toBeGreaterThan(0);
  });
  
  // 注文詳細取得テスト
  test('注文詳細を取得できること', async () => {
    const response = await request(app)
      .get(`/api/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.order._id).toBe(testOrderId);
    expect(response.body.order.items).toHaveLength(1);
    expect(response.body.order.totalAmount).toBe(2700);
  });
  
  // 注文ステータス更新テスト（管理者のみ）
  test('管理者が注文ステータスを更新できること', async () => {
    const updateData = {
      status: OrderStatus.PROCESSING,
    };
    
    const response = await request(app)
      .patch(`/api/orders/${testOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.order.status).toBe(OrderStatus.PROCESSING);
    
    // データベースでも更新されていることを確認
    const updatedOrder = await Order.findById(testOrderId);
    expect(updatedOrder?.status).toBe(OrderStatus.PROCESSING);
  });
}); 