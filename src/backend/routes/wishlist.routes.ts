import express from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const wishlistController = new WishlistController();

// すべてのお気に入りAPIはログインが必要
router.use(authMiddleware.verifyToken);

// お気に入りリストを取得
router.get('/', wishlistController.getWishlist);

// 商品をお気に入りに追加
router.post('/add', wishlistController.addToWishlist);

// お気に入りから商品を削除
router.delete('/remove/:productId', wishlistController.removeFromWishlist);

// お気に入りをすべて削除
router.delete('/clear', wishlistController.clearWishlist);

// 商品がお気に入りに入っているか確認
router.get('/check/:productId', wishlistController.checkProductInWishlist);

export { router as wishlistRoutes }; 