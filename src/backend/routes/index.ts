import express from 'express';
import { productRoutes } from './product.routes';
import { authRoutes } from './auth.routes';
import { categoryRoutes } from './category.routes';
import { orderRoutes } from './order.routes';

const router = express.Router();

// ヘルスチェック用エンドポイント
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// 各APIルートをマウント
router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);

export { router as apiRouter }; 