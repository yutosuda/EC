import mongoose, { Document, Schema } from 'mongoose';

// お気に入り（ウィッシュリスト）タイプの定義
export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// お気に入りスキーマ定義
const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ユーザーIDは必須です'],
      unique: true, // 1ユーザーにつき1つのお気に入りリスト
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 商品をお気に入りに追加するメソッド
wishlistSchema.methods.addProduct = function(productId: mongoose.Types.ObjectId) {
  // 既に追加されていない場合のみ追加
  if (!this.products.includes(productId)) {
    this.products.push(productId);
  }
  return this;
};

// 商品をお気に入りから削除するメソッド
wishlistSchema.methods.removeProduct = function(productId: mongoose.Types.ObjectId) {
  this.products = this.products.filter(
    (id: mongoose.Types.ObjectId) => !id.equals(productId)
  );
  return this;
};

// 商品がお気に入りに含まれているか確認するメソッド
wishlistSchema.methods.hasProduct = function(productId: mongoose.Types.ObjectId): boolean {
  return this.products.some(
    (id: mongoose.Types.ObjectId) => id.equals(productId)
  );
};

// インデックスの設定
wishlistSchema.index({ user: 1 });

// ウィッシュリストモデルのインターフェース拡張
interface WishlistModel extends mongoose.Model<IWishlist> {
  findOrCreateWishlist(userId: mongoose.Types.ObjectId): Promise<IWishlist>;
}

// ウィッシュリストを見つけるか作成するスタティックメソッド
wishlistSchema.statics.findOrCreateWishlist = async function(
  userId: mongoose.Types.ObjectId
): Promise<IWishlist> {
  let wishlist = await this.findOne({ user: userId });
  
  if (!wishlist) {
    wishlist = new this({
      user: userId,
      products: [],
    });
    await wishlist.save();
  }
  
  return wishlist;
};

// ウィッシュリストモデルの作成とエクスポート
export const Wishlist = mongoose.model<IWishlist, WishlistModel>('Wishlist', wishlistSchema); 