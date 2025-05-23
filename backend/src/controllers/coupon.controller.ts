import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Coupon, CouponType, ICoupon } from '../models/coupon.model';

interface UpdateData {
  [key: string]: any;
}

export class CouponController {
  // クーポンコードの有効性を検証
  validateCoupon = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { code } = req.body;

      // バリデーション
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'クーポンコードは必須です',
        });
      }

      // クーポンを検索
      const coupon = await Coupon.findOne({ code });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: '有効なクーポンコードではありません',
        });
      }

      // クーポンの有効性をチェック
      const now = new Date();
      const isValid = 
        coupon.isActive &&
        now >= coupon.startDate &&
        now <= coupon.endDate &&
        (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'このクーポンは有効期限切れか使用上限に達しています',
        });
      }

      // ユーザーが既にこのクーポンを使用済みか確認（ログイン済みの場合）
      if (req.user && coupon.userUsageLimit) {
        const userId = req.user._id;
        const userUsageCount = (coupon.usedBy || []).filter((id: mongoose.Types.ObjectId) => 
          id.toString() === userId.toString()
        ).length || 0;

        if (userUsageCount >= coupon.userUsageLimit) {
          return res.status(400).json({
            success: false,
            message: 'このクーポンは既に最大回数使用されています',
          });
        }
      }

      res.status(200).json({
        success: true,
        message: '有効なクーポンです',
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minimumPurchase: coupon.minimumPurchase,
          maxDiscount: coupon.maxDiscount,
        },
      });
    } catch (error) {
      console.error('クーポン検証エラー:', error);
      res.status(500).json({
        success: false,
        message: 'クーポンの検証中にエラーが発生しました',
      });
    }
  };

  // クーポンを適用（注文確定時に使用）
  applyCoupon = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user?._id;
      const { code, orderAmount } = req.body;

      // バリデーション
      if (!code || !orderAmount) {
        return res.status(400).json({
          success: false,
          message: 'クーポンコードと注文金額は必須です',
        });
      }

      // クーポンを検索
      const coupon = await Coupon.findOne({ code });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: '有効なクーポンコードではありません',
        });
      }

      // クーポンの有効性をチェック
      const now = new Date();
      const isValid = 
        coupon.isActive &&
        now >= coupon.startDate &&
        now <= coupon.endDate &&
        (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'このクーポンは有効期限切れか使用上限に達しています',
        });
      }

      // 最低購入金額をチェック
      if (coupon.minimumPurchase && orderAmount < coupon.minimumPurchase) {
        return res.status(400).json({
          success: false,
          message: `このクーポンは${coupon.minimumPurchase}円以上の注文で使用できます`,
        });
      }

      // ユーザーが既にこのクーポンを使用済みか確認（ログイン済みの場合）
      if (userId && coupon.userUsageLimit) {
        const userUsageCount = (coupon.usedBy || []).filter((id: mongoose.Types.ObjectId) => 
          id.toString() === userId.toString()
        ).length || 0;

        if (userUsageCount >= coupon.userUsageLimit) {
          return res.status(400).json({
            success: false,
            message: 'このクーポンは既に最大回数使用されています',
          });
        }
      }

      // 割引額を計算
      let discountAmount = 0;
      
      if (coupon.type === CouponType.PERCENTAGE) {
        discountAmount = (orderAmount * coupon.value) / 100;
      } else if (coupon.type === CouponType.FIXED_AMOUNT) {
        discountAmount = coupon.value;
      }

      // 最大割引額を適用
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }

      // 割引後の金額を計算
      const discountedAmount = orderAmount - discountAmount;

      res.status(200).json({
        success: true,
        message: 'クーポンが適用されました',
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
        },
        discountAmount,
        discountedAmount,
      });
    } catch (error) {
      console.error('クーポン適用エラー:', error);
      res.status(500).json({
        success: false,
        message: 'クーポンの適用中にエラーが発生しました',
      });
    }
  };

  // クーポン使用をマーク（注文完了時に使用）
  markCouponAsUsed = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user?._id;
      const { code } = req.body;

      // バリデーション
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'クーポンコードは必須です',
        });
      }

      // クーポンを検索
      const coupon = await Coupon.findOne({ code });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: '有効なクーポンコードではありません',
        });
      }

      // クーポンの使用回数を増やす
      coupon.usageCount += 1;

      // ユーザーがログイン済みの場合、使用ユーザーリストに追加
      if (userId) {
        if (!coupon.usedBy) {
          coupon.usedBy = [];
        }
        coupon.usedBy.push(userId);
      }

      await coupon.save();

      res.status(200).json({
        success: true,
        message: 'クーポンの使用が記録されました',
      });
    } catch (error) {
      console.error('クーポン使用記録エラー:', error);
      res.status(500).json({
        success: false,
        message: 'クーポンの使用記録中にエラーが発生しました',
      });
    }
  };

  // 管理者用：すべてのクーポンを取得
  getAllCoupons = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      // 管理者権限をチェック
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'この操作を実行する権限がありません',
        });
      }

      const coupons = await Coupon.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        coupons,
      });
    } catch (error) {
      console.error('クーポン取得エラー:', error);
      res.status(500).json({
        success: false,
        message: 'クーポンの取得中にエラーが発生しました',
      });
    }
  };

  // 管理者用：クーポンを作成
  createCoupon = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      // 管理者権限をチェック
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'この操作を実行する権限がありません',
        });
      }

      const {
        code,
        type,
        value,
        minimumPurchase,
        maxDiscount,
        startDate,
        endDate,
        isActive,
        usageLimit,
        userUsageLimit,
      } = req.body;

      // バリデーション
      if (!code || !type || !value || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'コード、タイプ、値、開始日、終了日は必須です',
        });
      }

      // クーポンコードの重複チェック
      const existingCoupon = await Coupon.findOne({ code });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'このクーポンコードは既に使用されています',
        });
      }

      // 新しいクーポンを作成
      const coupon = new Coupon({
        code,
        type,
        value,
        minimumPurchase,
        maxDiscount,
        startDate,
        endDate,
        isActive: isActive !== undefined ? isActive : true,
        usageLimit,
        usageCount: 0,
        userUsageLimit,
        usedBy: [],
      });

      await coupon.save();

      res.status(201).json({
        success: true,
        message: 'クーポンが作成されました',
        coupon,
      });
    } catch (error) {
      console.error('クーポン作成エラー:', error);
      res.status(500).json({
        success: false,
        message: 'クーポンの作成中にエラーが発生しました',
      });
    }
  };

  // 管理者用：クーポンを更新
  updateCoupon = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      // 管理者権限をチェック
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'この操作を実行する権限がありません',
        });
      }

      const { couponId } = req.params;
      const updateData = req.body as UpdateData;

      // クーポンが存在するか確認
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'クーポンが見つかりません',
        });
      }

      // コードを変更する場合は重複チェック
      if (updateData.code && updateData.code !== coupon.code) {
        const existingCoupon = await Coupon.findOne({ code: updateData.code });
        if (existingCoupon) {
          return res.status(400).json({
            success: false,
            message: 'このクーポンコードは既に使用されています',
          });
        }
      }

      // クーポンを更新
      // ICouponのキーである場合のみ、更新する
      const couponDoc = coupon as unknown as { [key: string]: any };
      
      Object.keys(updateData).forEach(key => {
        if (key in coupon) {
          couponDoc[key] = updateData[key];
        }
      });

      await coupon.save();

      res.status(200).json({
        success: true,
        message: 'クーポンが更新されました',
        coupon,
      });
    } catch (error) {
      console.error('クーポン更新エラー:', error);
      res.status(500).json({
        success: false,
        message: 'クーポンの更新中にエラーが発生しました',
      });
    }
  };

  // 管理者用：クーポンを削除
  deleteCoupon = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      // 管理者権限をチェック
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'この操作を実行する権限がありません',
        });
      }

      const { couponId } = req.params;

      // クーポンが存在するか確認
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'クーポンが見つかりません',
        });
      }

      // クーポンを削除
      await Coupon.findByIdAndDelete(couponId);

      res.status(200).json({
        success: true,
        message: 'クーポンが削除されました',
      });
    } catch (error) {
      console.error('クーポン削除エラー:', error);
      res.status(500).json({
        success: false,
        message: 'クーポンの削除中にエラーが発生しました',
      });
    }
  };
} 