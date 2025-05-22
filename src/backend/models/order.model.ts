import mongoose, { Document, Schema } from 'mongoose';

// 注文ステータスの列挙型
export enum OrderStatus {
  PENDING = 'pending',            // 支払い待ち
  PROCESSING = 'processing',      // 処理中
  SHIPPED = 'shipped',            // 発送済み
  DELIVERED = 'delivered',        // 配送完了
  CANCELLED = 'cancelled',        // キャンセル
  REFUNDED = 'refunded',          // 返金済み
}

// 支払い方法の列挙型
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',    // クレジットカード
  BANK_TRANSFER = 'bank_transfer', // 銀行振込
  CONVENIENCE = 'convenience',     // コンビニ決済
  COD = 'cod',                     // 代金引換
}

// 注文アイテムのインターフェース
interface OrderItem {
  product: mongoose.Types.ObjectId;
  productSnapshot: {              // 注文時点での商品情報のスナップショット
    name: string;
    sku: string;
    price: number;
    image?: string;
  };
  quantity: number;
  price: number;                  // 注文時点での商品価格
  total: number;                  // 小計（価格 x 数量）
}

// 住所インターフェース
interface Address {
  postalCode: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
}

// 注文インターフェース
export interface IOrder extends Document {
  orderNumber: string;            // 注文番号
  user: mongoose.Types.ObjectId;  // 注文したユーザー
  items: OrderItem[];             // 注文アイテム
  totalAmount: number;            // 合計金額（税込）
  tax: number;                    // 消費税額
  shippingFee: number;            // 送料
  status: OrderStatus;            // 注文ステータス
  paymentMethod: PaymentMethod;   // 支払い方法
  paymentStatus: 'pending' | 'paid' | 'failed'; // 支払いステータス
  shippingAddress: Address;       // 配送先住所
  trackingNumber?: string;        // 追跡番号
  shippingCompany?: string;       // 配送会社
  notes?: string;                 // 備考
  agreedTerms: boolean;           // 利用規約同意
  agreedSpecialConditions?: boolean; // 特別条件への同意（中古品など）
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;                  // 支払完了日時
  shippedAt?: Date;               // 発送日時
  deliveredAt?: Date;             // 配送完了日時
}

// 注文スキーマ定義
const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productSnapshot: {
          name: {
            type: String,
            required: true,
          },
          sku: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
          image: {
            type: String,
          },
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    shippingAddress: {
      postalCode: {
        type: String,
        required: true,
      },
      prefecture: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      address1: {
        type: String,
        required: true,
      },
      address2: {
        type: String,
      },
    },
    trackingNumber: {
      type: String,
    },
    shippingCompany: {
      type: String,
    },
    notes: {
      type: String,
    },
    agreedTerms: {
      type: Boolean,
      required: true,
      default: false,
    },
    agreedSpecialConditions: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// インデックスの設定
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: 1 });

// 注文番号を自動生成するための静的メソッド
orderSchema.statics.generateOrderNumber = async function() {
  const date = new Date();
  const prefix = date.getFullYear().toString().substr(-2) + 
                (date.getMonth() + 1).toString().padStart(2, '0') + 
                date.getDate().toString().padStart(2, '0');
  
  // その日の最後の注文を見つける
  const lastOrder = await this.findOne({
    orderNumber: new RegExp(`^${prefix}`)
  }).sort({ orderNumber: -1 });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

// 注文番号を自動生成するための静的メソッド
orderSchema.statics.generateOrderNumber = async function() {
  const date = new Date();
  const prefix = date.getFullYear().toString().substr(-2) + 
                (date.getMonth() + 1).toString().padStart(2, '0') + 
                date.getDate().toString().padStart(2, '0');
  
  // その日の最後の注文を見つける
  const lastOrder = await this.findOne({
    orderNumber: new RegExp(`^${prefix}`)
  }).sort({ orderNumber: -1 });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

// 注文モデルのインターフェースを拡張して静的メソッドを含める
interface OrderModel extends mongoose.Model<IOrder> {
  generateOrderNumber(): Promise<string>;
}

// 注文モデルの作成とエクスポート
export const Order = mongoose.model<IOrder, OrderModel>('Order', orderSchema); 