import { Cart } from '../models/cart.model';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';

// 見積書項目の型定義
interface QuotationItem {
  product: any;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// 見積書データの型定義
export interface QuotationData {
  quotationNumber: string;
  createdAt: Date;
  expiresAt: Date;
  customer: {
    name: string;
    companyName?: string;
    email: string;
    address?: {
      postalCode: string;
      prefecture: string;
      city: string;
      address1: string;
      address2?: string;
    };
  };
  items: QuotationItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  notes?: string;
}

/**
 * 見積書サービス - BtoB顧客向けの見積書作成機能
 */
export class QuotationService {
  /**
   * カートの内容から見積書データを生成
   * @param userId ユーザーID
   * @param expiryDays 見積もり有効期限（日数）
   * @param notes 備考
   * @returns 見積書データ
   */
  static async generateQuotationFromCart(
    userId: string,
    expiryDays: number = 30,
    notes?: string
  ): Promise<QuotationData> {
    // ユーザー情報を取得
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    // カート情報を取得
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw new Error('カートが空です');
    }

    // 商品詳細を取得
    const productIds = cart.items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // 商品マップを作成（ID => 商品オブジェクト）
    const productMap = products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {} as Record<string, any>);

    // 見積書アイテムを作成
    const items: QuotationItem[] = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const productId = cartItem.product.toString();
      const product = productMap[productId];
      
      if (!product) {
        continue; // 商品が見つからない場合はスキップ
      }

      // BtoBユーザーの場合は特別価格を適用
      const unitPrice = user.role === 'business' && user.specialPricing
        ? calculateBusinessPrice(product.price)
        : product.price;

      const itemSubtotal = unitPrice * cartItem.quantity;
      subtotal += itemSubtotal;

      items.push({
        product: {
          _id: product.id,
          name: product.name,
          sku: product.sku,
          description: product.description,
        },
        quantity: cartItem.quantity,
        unitPrice,
        subtotal: itemSubtotal,
      });
    }

    // 税額を計算（10%）
    const taxRate = 0.1;
    const taxAmount = Math.round(subtotal * taxRate);

    // 配送料（仮の固定値）
    const shippingFee = 1000;

    // 合計金額
    const totalAmount = subtotal + taxAmount + shippingFee;

    // 見積書番号を生成（現在日時 + ユーザーID後方4桁 + ランダム数字4桁）
    const date = new Date();
    const dateStr = date.getFullYear().toString().slice(-2) +
      padZero(date.getMonth() + 1) +
      padZero(date.getDate());
    const userIdEnd = userId.slice(-4);
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const quotationNumber = `Q${dateStr}-${userIdEnd}-${randomNum}`;

    // 有効期限を設定
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // 請求先住所を取得
    const billingAddress = user.addresses.find(addr => addr.addressType === 'billing' && addr.isDefault);

    // 見積書データを作成
    const quotationData: QuotationData = {
      quotationNumber,
      createdAt: new Date(),
      expiresAt,
      customer: {
        name: `${user.lastName} ${user.firstName}`,
        companyName: user.companyName,
        email: user.email,
        address: billingAddress ? {
          postalCode: billingAddress.postalCode,
          prefecture: billingAddress.prefecture,
          city: billingAddress.city,
          address1: billingAddress.address1,
          address2: billingAddress.address2,
        } : undefined,
      },
      items,
      subtotal,
      taxRate,
      taxAmount,
      shippingFee,
      totalAmount,
      notes,
    };

    return quotationData;
  }
}

/**
 * BtoB顧客向けの特別価格を計算
 * @param basePrice 基本価格
 * @returns 割引後価格
 */
function calculateBusinessPrice(basePrice: number): number {
  // 仮の割引率（10%オフ）
  const discountRate = 0.1;
  return Math.round(basePrice * (1 - discountRate));
}

/**
 * 数値を2桁の文字列にパディング
 * @param num 数値
 * @returns 2桁の文字列
 */
function padZero(num: number): string {
  return num.toString().padStart(2, '0');
} 