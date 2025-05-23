import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import { User, Product, Category, Cart } from '../models';
import { quotationRoutes } from '../routes/quotation.routes';
import { errorHandler } from '../middlewares/error.middleware';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middlewares/auth.middleware';

dotenv.config();

// テスト用の Express アプリ
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  // テスト用の認証済みユーザー
  req.user = {
    _id: 'test-user-id',
    email: 'test@example.com',
    role: 'business'
  };
  next();
});
app.use('/api/quotations', quotationRoutes);
app.use(errorHandler);

// テスト用データ
let testUserId: string;
let testProductId: string;
let testCategoryId: string;
let testCartId: string;
let businessToken: string;

// MongoDB に接続し、テスト前に必要なデータをセットアップ
beforeAll(async () => {
  // テスト用 MongoDB に接続
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/construction-ec-test?authSource=admin';
  await mongoose.connect(MONGODB_URI);
  
  // テスト用データをクリーンアップ
  await User.deleteMany({ email: /^quotation-test/ });
  await Category.deleteMany({ name: /^見積テスト/ });
  await Product.deleteMany({ name: /^見積テスト/ });
  await Cart.deleteMany({ user: /.*/ });
  
  // テスト用のカテゴリを作成
  const category = new Category({
    name: '見積テストカテゴリ',
    description: '見積もりテスト用カテゴリ',
    slug: 'test-quotation-category',
    isActive: true,
  });
  const savedCategory = await category.save();
  testCategoryId = savedCategory._id.toString();
  
  // テスト用の商品を作成
  const product = new Product({
    name: '見積テスト商品',
    description: '見積もりテスト用商品の説明',
    price: 10000,
    comparePrice: 15000,
    sku: 'TEST-QUOTE-001',
    images: ['test-image.jpg'],
    mainImage: 'test-image.jpg',
    category: savedCategory._id,
    stock: 100,
    isVisible: true,
  });
  const savedProduct = await product.save();
  testProductId = savedProduct._id.toString();
  
  // テスト用のビジネスユーザーを作成
  const businessUser = new User({
    email: 'quotation-test-business@example.com',
    password: 'Password123',
    firstName: '法人',
    lastName: 'テスト',
    role: 'business',
    accountType: 'business',
    companyName: 'テスト建設株式会社',
    department: '資材部',
    position: '部長',
    businessType: '建設業',
    taxId: '1234567890123',
    isApproved: true,
    specialPricing: true,
    addresses: [
      {
        addressType: 'billing',
        postalCode: '123-4567',
        prefecture: '東京都',
        city: '千代田区',
        address1: '丸の内1-1-1',
        isDefault: true,
      }
    ]
  });
  const savedUser = await businessUser.save();
  testUserId = savedUser._id.toString();
  
  // テスト用のカートを作成
  const cart = new Cart({
    user: testUserId,
    items: [
      {
        product: testProductId,
        quantity: 5,
        price: 10000,
      }
    ],
    totalAmount: 50000,
  });
  const savedCart = await cart.save();
  testCartId = savedCart._id.toString();
  
  // JWTトークンを生成
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  businessToken = jwt.sign(
    { id: testUserId, email: savedUser.email, role: savedUser.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
});

// テスト終了後にデータベース接続を閉じる
afterAll(async () => {
  await mongoose.connection.close();
});

describe('見積書API統合テスト', () => {
  // 見積書生成のテスト
  test('カートから見積書を生成できること', async () => {
    const response = await request(app)
      .post('/api/quotations/generate')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ 
        expiryDays: 30,
        notes: 'テスト用見積書です。'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.quotation).toBeDefined();
    expect(response.body.quotation.customer.companyName).toBe('テスト建設株式会社');
    expect(response.body.quotation.items).toHaveLength(1);
    expect(response.body.quotation.items[0].product.name).toBe('見積テスト商品');
    expect(response.body.quotation.subtotal).toBeDefined();
    expect(response.body.quotation.taxAmount).toBeDefined();
    expect(response.body.quotation.totalAmount).toBeDefined();
  });
  
  // 見積書PDF生成のテスト
  test('見積書PDFを生成しようとすると現状は未実装メッセージが返ること', async () => {
    const response = await request(app)
      .post('/api/quotations/generate-pdf')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ 
        expiryDays: 30,
        notes: 'テスト用見積書PDFです。'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('PDF生成機能は現在開発中です');
    expect(response.body.quotation).toBeDefined();
  });
}); 