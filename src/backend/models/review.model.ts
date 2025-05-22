import mongoose, { Document, Schema } from 'mongoose';

// レビュータイプの定義
export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// レビュースキーマ定義
const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, '商品IDは必須です'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ユーザーIDは必須です'],
    },
    rating: {
      type: Number,
      required: [true, '評価は必須です'],
      min: [1, '評価は1以上である必要があります'],
      max: [5, '評価は5以下である必要があります'],
    },
    title: {
      type: String,
      required: [true, 'タイトルは必須です'],
      trim: true,
      maxlength: [100, 'タイトルは100文字以内である必要があります'],
    },
    comment: {
      type: String,
      required: [true, 'レビュー内容は必須です'],
      trim: true,
      maxlength: [1000, 'レビュー内容は1000文字以内である必要があります'],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false, // 管理者による承認が必要な場合はfalse
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 1ユーザーにつき1商品に1レビューのみ許可する制約
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
// 検索用インデックス
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ isApproved: 1 });

// レビューモデルの作成とエクスポート
export const Review = mongoose.model<IReview>('Review', reviewSchema); 