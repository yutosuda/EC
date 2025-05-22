import mongoose, { Document, Schema } from 'mongoose';

// クーポンタイプの列挙型
export enum CouponType {
  PERCENTAGE = 'percentage', // パーセント割引
  FIXED_AMOUNT = 'fixed_amount', // 固定金額割引
}

// クーポンタイプの定義
export interface ICoupon extends Document {
  code: string;
  type: CouponType;
  value: number; // パーセントまたは固定金額
  minimumPurchase?: number; // 最低購入金額
  maxDiscount?: number; // 最大割引額（パーセント割引の場合）
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit?: number; // 全体の利用上限回数
  usageCount: number; // 使用回数
  userUsageLimit?: number; // 1ユーザーあたりの利用上限回数
  applicableProducts?: mongoose.Types.ObjectId[]; // 適用可能商品（空の場合は全商品）
  applicableCategories?: mongoose.Types.ObjectId[]; // 適用可能カテゴリ（空の場合は全カテゴリ）
  createdAt: Date;
  updatedAt: Date;
}

// クーポンスキーマ定義
const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'クーポンコードは必須です'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(CouponType),
      required: [true, 'クーポンタイプは必須です'],
    },
    value: {
      type: Number,
      required: [true, '割引値は必須です'],
      min: [0, '割引値は0以上である必要があります'],
    },
    minimumPurchase: {
      type: Number,
      min: [0, '最低購入金額は0以上である必要があります'],
    },
    maxDiscount: {
      type: Number,
      min: [0, '最大割引額は0以上である必要があります'],
    },
    startDate: {
      type: Date,
      required: [true, '開始日は必須です'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, '終了日は必須です'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      min: [0, '利用上限回数は0以上である必要があります'],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    userUsageLimit: {
      type: Number,
      min: [0, 'ユーザーあたりの利用上限回数は0以上である必要があります'],
    },
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// クーポンが有効かどうかを確認するメソッド
couponSchema.methods.isValid = function(): boolean {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (!this.usageLimit || this.usageCount < this.usageLimit)
  );
};

// ユーザーがクーポンを使用できるかを確認するメソッド
couponSchema.methods.canBeUsedByUser = async function(
  userId: mongoose.Types.ObjectId,
  userUsage: number
): Promise<boolean> {
  // ユーザー使用制限がない場合は使用可能
  if (!this.userUsageLimit) return true;
  
  // 指定されたユーザーの使用回数が制限未満なら使用可能
  return userUsage < this.userUsageLimit;
};

// クーポンの割引額を計算するメソッド
couponSchema.methods.calculateDiscount = function(cartTotal: number): number {
  // 最低購入金額を満たしていない場合は割引なし
  if (this.minimumPurchase && cartTotal < this.minimumPurchase) {
    return 0;
  }

  let discount = 0;

  if (this.type === CouponType.PERCENTAGE) {
    // パーセント割引の場合
    discount = (cartTotal * this.value) / 100;
    
    // 最大割引額が設定されている場合、それを超えないようにする
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else if (this.type === CouponType.FIXED_AMOUNT) {
    // 固定金額割引の場合
    discount = this.value;
    
    // 割引額がカート合計を超えないようにする
    if (discount > cartTotal) {
      discount = cartTotal;
    }
  }

  return discount;
};

// インデックスの設定
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

// クーポンモデルの作成とエクスポート
export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema); 