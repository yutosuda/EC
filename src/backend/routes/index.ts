import express from 'express';
import { productRoutes } from './product.routes';
import { authRoutes } from './auth.routes';
import { categoryRoutes } from './category.routes';
import { orderRoutes } from './order.routes';
import { cartRoutes } from './cart.routes';
import { wishlistRoutes } from './wishlist.routes';
import { reviewRoutes } from './review.routes';
import { couponRoutes } from './coupon.routes';
import { paymentRoutes } from './payment.routes';
import { quotationRoutes } from './quotation.routes';

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
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/payments', paymentRoutes);
router.use('/quotations', quotationRoutes);

export { router as apiRouter }; 