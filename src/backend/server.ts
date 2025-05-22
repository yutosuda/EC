import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.routes';
import { productRoutes } from './routes/product.routes';
import { categoryRoutes } from './routes/category.routes';
import { orderRoutes } from './routes/order.routes';
import { cartRoutes } from './routes/cart.routes';
import { wishlistRoutes } from './routes/wishlist.routes';
import { reviewRoutes } from './routes/review.routes';
import { couponRoutes } from './routes/coupon.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// 環境変数の読み込み
dotenv.config();

// Expressアプリケーションの作成
const app = express();

// ミドルウェアの設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB接続
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/construction-ec?authSource=admin';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB接続成功');
  })
  .catch((error) => {
    console.error('MongoDB接続エラー:', error);
    process.exit(1);
  });

// ルートハンドラー
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '建設資材ECサイトAPIサーバーが稼働中です' });
});

// APIルート
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);

// 404ハンドラー - 存在しないルートに対するハンドラー
app.use(notFoundHandler);

// グローバルエラーハンドリングミドルウェア
app.use(errorHandler);

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
}); 