import express from 'express';
import { CartController } from '../controllers/cart.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();
const cartController = new CartController();

// すべてのカートAPIはログインが必要
router.use(asyncHandler(authMiddleware.verifyToken));

// カートを取得
router.get('/', asyncHandler(cartController.getCart));

// 商品をカートに追加
router.post('/add', asyncHandler(cartController.addToCart));

// カートから商品を削除
router.delete('/remove/:productId', asyncHandler(cartController.removeFromCart));

// カートを空にする
router.delete('/clear', asyncHandler(cartController.clearCart));

// カート内の商品数量を更新
router.put('/update/:productId', asyncHandler(cartController.updateCartItemQuantity));

export { router as cartRoutes }; 