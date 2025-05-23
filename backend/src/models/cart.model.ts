import mongoose, { Document, Schema } from 'mongoose';

// カートアイテムのインターフェース
interface CartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;  // 追加時の価格
  addedAt: Date;
}

// カートタイプの定義
export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: CartItem[];
  totalAmount: number;
  updatedAt: Date;
  createdAt: Date;
}

// カートスキーマ定義
const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,  // 1ユーザーにつき1カート
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// カートの合計金額を計算するメソッド
cartSchema.methods.calculateTotalAmount = function() {
  this.totalAmount = this.items.reduce((total: number, item: CartItem) => {
    return total + (item.price * item.quantity);
  }, 0);
  return this.totalAmount;
};

// カートからアイテムを削除するメソッド
cartSchema.methods.removeItem = function(productId: mongoose.Types.ObjectId) {
  this.items = this.items.filter((item: CartItem) => !item.product.equals(productId));
  this.calculateTotalAmount();
  return this;
};

// カートに商品を追加または更新するメソッド
cartSchema.methods.addOrUpdateItem = function(
  productId: mongoose.Types.ObjectId,
  quantity: number,
  price: number
) {
  const existingItemIndex = this.items.findIndex((item: CartItem) => item.product.equals(productId));

  if (existingItemIndex > -1) {
    // 既存のアイテムを更新
    this.items[existingItemIndex].quantity = quantity;
    this.items[existingItemIndex].price = price;
    this.items[existingItemIndex].addedAt = new Date();
  } else {
    // 新しいアイテムを追加
    this.items.push({
      product: productId,
      quantity,
      price,
      addedAt: new Date(),
    });
  }

  this.calculateTotalAmount();
  return this;
};

// インデックスの設定
cartSchema.index({ user: 1 });
cartSchema.index({ updatedAt: 1 });

// カートモデルのインターフェース拡張
interface CartModel extends mongoose.Model<ICart> {
  findOrCreateCart(userId: mongoose.Types.ObjectId): Promise<ICart>;
}

// カートを見つけるか作成するスタティックメソッド
cartSchema.statics.findOrCreateCart = async function(userId: mongoose.Types.ObjectId): Promise<ICart> {
  let cart = await this.findOne({ user: userId });
  
  if (!cart) {
    cart = new this({
      user: userId,
      items: [],
      totalAmount: 0,
    });
    await cart.save();
  }
  
  return cart;
};

// カートモデルの作成とエクスポート
export const Cart = mongoose.model<ICart, CartModel>('Cart', cartSchema); 