import express from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const couponController = new CouponController();

// クーポンコードの有効性を検証
router.post('/validate', couponController.validateCoupon);

// クーポンを適用（注文確定時に使用）
router.post('/apply', authMiddleware.verifyToken, couponController.applyCoupon);

// クーポン使用をマーク（注文完了時に使用）
router.post('/mark-used', authMiddleware.verifyToken, couponController.markCouponAsUsed);

// 以下は管理者用のエンドポイント
router.use('/admin', authMiddleware.verifyToken, authMiddleware.verifyAdmin);

// 管理者用ルート
router.get('/admin', couponController.getAllCoupons);
router.post('/admin', couponController.createCoupon);
router.put('/admin/:couponId', couponController.updateCoupon);
router.delete('/admin/:couponId', couponController.deleteCoupon);

export { router as couponRoutes }; 