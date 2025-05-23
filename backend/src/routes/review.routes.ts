import express from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();
const reviewController = new ReviewController();

// 商品のレビューを取得（認証不要）
router.get('/product/:productId', asyncHandler(reviewController.getProductReviews));

// 以下のAPIはログインが必要
router.use(authMiddleware.verifyToken);

// レビューを作成
router.post('/', asyncHandler(reviewController.createReview));

// レビューを更新
router.put('/:reviewId', asyncHandler(reviewController.updateReview));

// レビューを削除
router.delete('/:reviewId', asyncHandler(reviewController.deleteReview));

// レビューを役立つとマーク
router.post('/:reviewId/helpful', asyncHandler(reviewController.markReviewAsHelpful));

export { router as reviewRoutes }; 