import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Stripeキーの取得
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Stripeクライアントの初期化
if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not set. Payment service will not work properly.');
}

// Stripeインスタンスの作成（キーが未設定の場合はモックモードで動作）
const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' }) 
  : null;

/**
 * 支払い処理サービス
 */
export class PaymentService {
  /**
   * 決済意図（payment intent）を作成
   * @param amount 金額（日本円）
   * @param currency 通貨コード（デフォルトはJPY）
   * @param metadata メタデータ
   * @returns 決済意図オブジェクト
   */
  static async createPaymentIntent(
    amount: number, 
    currency: string = 'jpy',
    metadata: any = {}
  ) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        payment_method_types: ['card'],
      });
      
      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw error;
    }
  }

  /**
   * 決済意図のステータスを確認
   * @param paymentIntentId 決済意図ID
   * @returns 決済意図オブジェクト
   */
  static async retrievePaymentIntent(paymentIntentId: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Failed to retrieve payment intent:', error);
      throw error;
    }
  }

  /**
   * 顧客（Customer）を作成
   * @param email 顧客のメールアドレス
   * @param name 顧客名
   * @returns 顧客オブジェクト
   */
  static async createCustomer(email: string, name: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      
      return customer;
    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      throw error;
    }
  }

  /**
   * 返金処理
   * @param paymentIntentId 決済意図ID
   * @param amount 返金金額（指定しない場合は全額返金）
   * @returns 返金オブジェクト
   */
  static async createRefund(paymentIntentId: string, amount?: number) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };
      
      if (amount) {
        refundParams.amount = amount;
      }
      
      const refund = await stripe.refunds.create(refundParams);
      return refund;
    } catch (error) {
      console.error('Failed to process refund:', error);
      throw error;
    }
  }

  /**
   * Webhookイベントの検証と解析
   * @param payload Webhookのrawボディ
   * @param signature Stripeシグネチャヘッダ
   * @returns 解析されたイベント
   */
  static constructWebhookEvent(payload: string, signature: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set. Webhook verification will not work.');
    }
    
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw error;
    }
  }
} 