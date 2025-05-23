import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Review, Product } from '../models';

export class ReviewController {
  // 商品の全レビューを取得
  getProductReviews = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { productId } = req.params;

      // バリデーション
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: '商品IDが必要です',
        });
      }

      // 商品が存在するか確認
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: '商品が見つかりません',
        });
      }

      // レビューを取得
      const reviews = await Review.find({ product: productId, isApproved: true })
        .sort({ createdAt: -1 })
        .populate('user', 'firstName lastName');

      // レビュー統計情報を取得
      const stats = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratings: {
              $push: '$rating'
            }
          }
        }
      ]);

      // 評価別のカウントを計算
      const ratingDistribution = stats.length > 0 
        ? [1, 2, 3, 4, 5].map(rating => ({
            rating,
            count: stats[0].ratings.filter((r: number) => r === rating).length,
            percentage: (stats[0].ratings.filter((r: number) => r === rating).length / stats[0].totalReviews) * 100
          }))
        : [];

      res.status(200).json({
        success: true,
        reviews,
        stats: stats.length > 0 ? {
          avgRating: stats[0].avgRating,
          totalReviews: stats[0].totalReviews,
          ratingDistribution
        } : {
          avgRating: 0,
          totalReviews: 0,
          ratingDistribution: []
        }
      });
    } catch (error) {
      console.error('レビュー取得エラー:', error);
      res.status(500).json({
        success: false,
        message: 'レビューの取得中にエラーが発生しました',
      });
    }
  };

  // レビューを作成
  createReview = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user._id;
      const { productId, rating, title, comment } = req.body;

      // バリデーション
      if (!productId || !rating || !title || !comment) {
        return res.status(400).json({
          success: false,
          message: '商品ID、評価、タイトル、コメントは必須項目です',
        });
      }

      // 商品が存在するか確認
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: '商品が見つかりません',
        });
      }

      // ユーザーが同じ商品に既にレビューを投稿していないか確認
      const existingReview = await Review.findOne({ 
        user: userId, 
        product: productId 
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'すでにこの商品のレビューを投稿しています',
        });
      }

      // 新しいレビューを作成
      const review = new Review({
        product: productId,
        user: userId,
        rating,
        title,
        comment,
        isVerifiedPurchase: false, // 注文履歴から検証する場合は実装が必要
        isApproved: true, // 自動承認（実際は管理者が承認する場合はfalseに設定）
        helpfulCount: 0,
      });

      await review.save();

      // ユーザー情報をポピュレート
      await review.populate('user', 'firstName lastName');

      res.status(201).json({
        success: true,
        message: 'レビューが投稿されました',
        review,
      });
    } catch (error) {
      console.error('レビュー作成エラー:', error);
      res.status(500).json({
        success: false,
        message: 'レビューの投稿中にエラーが発生しました',
      });
    }
  };

  // レビューを更新
  updateReview = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user._id;
      const { reviewId } = req.params;
      const { rating, title, comment } = req.body;

      // バリデーション
      if (!reviewId || !rating || !title || !comment) {
        return res.status(400).json({
          success: false,
          message: 'レビューID、評価、タイトル、コメントは必須項目です',
        });
      }

      // レビューが存在するか確認
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'レビューが見つかりません',
        });
      }

      // レビューがユーザー自身のものか確認
      if (review.user.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'このレビューを更新する権限がありません',
        });
      }

      // レビューを更新
      review.rating = rating;
      review.title = title;
      review.comment = comment;
      review.isApproved = true; // 更新後も自動承認（実際は管理者が承認する場合はfalseに設定）

      await review.save();

      // ユーザー情報をポピュレート
      await review.populate('user', 'firstName lastName');

      res.status(200).json({
        success: true,
        message: 'レビューが更新されました',
        review,
      });
    } catch (error) {
      console.error('レビュー更新エラー:', error);
      res.status(500).json({
        success: false,
        message: 'レビューの更新中にエラーが発生しました',
      });
    }
  };

  // レビューを削除
  deleteReview = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user._id;
      const { reviewId } = req.params;

      // バリデーション
      if (!reviewId) {
        return res.status(400).json({
          success: false,
          message: 'レビューIDが必要です',
        });
      }

      // レビューが存在するか確認
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'レビューが見つかりません',
        });
      }

      // レビューがユーザー自身のものか確認（管理者の場合は除外）
      if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'このレビューを削除する権限がありません',
        });
      }

      // レビューを削除
      await Review.findByIdAndDelete(reviewId);

      res.status(200).json({
        success: true,
        message: 'レビューが削除されました',
      });
    } catch (error) {
      console.error('レビュー削除エラー:', error);
      res.status(500).json({
        success: false,
        message: 'レビューの削除中にエラーが発生しました',
      });
    }
  };

  // レビューの役立ちカウントを増やす
  markReviewAsHelpful = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { reviewId } = req.params;

      // バリデーション
      if (!reviewId) {
        return res.status(400).json({
          success: false,
          message: 'レビューIDが必要です',
        });
      }

      // レビューが存在するか確認
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'レビューが見つかりません',
        });
      }

      // 役立ちカウントを増やす
      review.helpfulCount += 1;
      await review.save();

      res.status(200).json({
        success: true,
        message: 'レビューが役立つと評価されました',
        helpfulCount: review.helpfulCount,
      });
    } catch (error) {
      console.error('レビュー評価エラー:', error);
      res.status(500).json({
        success: false,
        message: 'レビューの評価中にエラーが発生しました',
      });
    }
  };
} 