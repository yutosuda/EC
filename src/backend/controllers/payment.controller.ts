import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { Order, OrderStatus } from '../models/order.model';

/**
 * 決済コントローラー
 */
export class PaymentController {
  /**
   * 決済意図（Payment Intent）を作成
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  static async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ 
          success: false, 
          message: '注文IDが必要です' 
        });
      }

      // 注文を検索
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: '注文が見つかりません' 
        });
      }

      // すでに支払い済みの場合はエラー
      if (order.status !== OrderStatus.PENDING) {
        return res.status(400).json({
          success: false,
          message: 'この注文はすでに処理されています',
        });
      }

      // 金額が確定していない場合はエラー
      if (!order.totalAmount) {
        return res.status(400).json({
          success: false,
          message: '注文金額が確定していません',
        });
      }

      // メタデータの設定
      const metadata = {
        orderId: order._id.toString(),
        customerEmail: req.user?.email,
      };

      // Stripe決済意図を作成（金額はint型で渡す必要がある）
      const paymentIntent = await PaymentService.createPaymentIntent(
        Math.round(order.totalAmount), // 小数点以下は四捨五入
        'jpy',
        metadata
      );

      // 注文に決済IDを保存
      order.paymentIntentId = paymentIntent.id;
      await order.save();

      // クライアントシークレットを返す
      res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 決済ステータスの確認
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  static async checkPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({ 
          success: false, 
          message: '注文IDが必要です' 
        });
      }

      // 注文を検索
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: '注文が見つかりません' 
        });
      }

      // 決済IDがない場合
      if (!order.paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'この注文には決済情報がありません',
        });
      }

      // Stripeから決済状態を取得
      const paymentIntent = await PaymentService.retrievePaymentIntent(order.paymentIntentId);

      // 決済状態に応じて注文ステータスを更新
      if (paymentIntent.status === 'succeeded') {
        if (order.status === OrderStatus.PENDING) {
          order.status = OrderStatus.PAID;
          await order.save();
        }
      }

      // 決済状態を返す
      res.status(200).json({
        success: true,
        paymentStatus: paymentIntent.status,
        orderStatus: order.status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Webhook処理（Stripeからの非同期通知を処理）
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({
          success: false,
          message: 'Stripe署名がありません',
        });
      }

      // Webhookイベントを検証
      const event = PaymentService.constructWebhookEvent(
        req.body.toString(),
        signature
      );

      // イベントタイプに応じて処理
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object);
          break;
        
        case 'payment_intent.payment_failed':
          await handlePaymentFailure(event.data.object);
          break;
        
        default:
          console.log(`未処理のイベント: ${event.type}`);
      }

      // 200 OKを返して受信を確認
      res.status(200).json({ received: true });
    } catch (error) {
      // Webhook検証に失敗した場合は400エラー
      return res.status(400).json({
        success: false,
        message: 'Webhook検証に失敗しました',
      });
    }
  }
}

/**
 * 決済成功時の処理
 * @param paymentIntent 決済意図オブジェクト
 */
async function handlePaymentSuccess(paymentIntent: any) {
  const orderId = paymentIntent.metadata.orderId;
  
  if (orderId) {
    const order = await Order.findById(orderId);
    
    if (order && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.PAID;
      await order.save();
      console.log(`注文 ${orderId} の決済が完了しました`);
    }
  }
}

/**
 * 決済失敗時の処理
 * @param paymentIntent 決済意図オブジェクト
 */
async function handlePaymentFailure(paymentIntent: any) {
  const orderId = paymentIntent.metadata.orderId;
  
  if (orderId) {
    const order = await Order.findById(orderId);
    
    if (order) {
      order.status = OrderStatus.PAYMENT_FAILED;
      await order.save();
      console.log(`注文 ${orderId} の決済が失敗しました: ${paymentIntent.last_payment_error?.message || '不明なエラー'}`);
    }
  }
} 