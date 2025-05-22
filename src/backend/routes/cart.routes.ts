import express from 'express';
import { CartController } from '../controllers/cart.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const cartController = new CartController();

// すべてのカートAPIはログインが必要
router.use(authMiddleware.verifyToken);

// カートを取得
router.get('/', cartController.getCart);

// 商品をカートに追加
router.post('/add', cartController.addToCart);

// カートから商品を削除
router.delete('/remove/:productId', cartController.removeFromCart);

// カートを空にする
router.delete('/clear', cartController.clearCart);

// カート内の商品数量を更新
router.put('/update/:productId', cartController.updateCartItemQuantity);

export { router as cartRoutes }; 