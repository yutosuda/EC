import mongoose, { Document, Schema } from 'mongoose';

// 商品タイプの定義
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;  // 参考価格（二重価格表示用）
  sku: string;
  images: string[];
  mainImage?: string;
  category: mongoose.Types.ObjectId;
  manufacturer: string;
  brand?: string;
  specifications: {
    [key: string]: string;  // 例: { "寸法": "100x200mm", "重量": "5kg" }
  };
  stock: number;
  isUsed: boolean;  // 中古品フラグ
  condition?: string;  // 中古品の状態説明
  isVisible: boolean;  // 表示/非表示設定
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 商品スキーマ定義
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, '商品名は必須です'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, '商品説明は必須です'],
    },
    price: {
      type: Number,
      required: [true, '価格は必須です'],
      min: [0, '価格は0以上である必要があります'],
    },
    comparePrice: {
      type: Number,
      min: [0, '参考価格は0以上である必要があります'],
    },
    sku: {
      type: String,
      required: [true, 'SKUは必須です'],
      unique: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    mainImage: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'カテゴリは必須です'],
    },
    manufacturer: {
      type: String,
      required: [true, 'メーカーは必須です'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    stock: {
      type: Number,
      required: [true, '在庫数は必須です'],
      min: [0, '在庫数は0以上である必要があります'],
      default: 0,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    condition: {
      type: String,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// 検索用のインデックスを設定
productSchema.index({ name: 'text', description: 'text', sku: 'text', manufacturer: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isVisible: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

// 商品モデルの作成とエクスポート
export const Product = mongoose.model<IProduct>('Product', productSchema); 