import mongoose, { Document, Schema } from 'mongoose';

// カテゴリタイプの定義
export interface ICategory extends Document {
  name: string;
  description?: string;
  slug: string;
  parent?: mongoose.Types.ObjectId;
  image?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// カテゴリスキーマ定義
const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'カテゴリ名は必須です'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'スラッグは必須です'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// インデックスの設定
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// カテゴリモデルの作成とエクスポート
export const Category = mongoose.model<ICategory>('Category', categorySchema); 