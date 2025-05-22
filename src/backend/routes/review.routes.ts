import express from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const reviewController = new ReviewController();

// 商品のレビューを取得（認証不要）
router.get('/product/:productId', reviewController.getProductReviews);

// 以下のAPIはログインが必要
router.use(authMiddleware.verifyToken);

// レビューを作成
router.post('/', reviewController.createReview);

// レビューを更新
router.put('/:reviewId', reviewController.updateReview);

// レビューを削除
router.delete('/:reviewId', reviewController.deleteReview);

// レビューを役立つとマーク
router.post('/:reviewId/helpful', reviewController.markReviewAsHelpful);

export { router as reviewRoutes }; 