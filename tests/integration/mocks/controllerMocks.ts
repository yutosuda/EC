/**
 * コントローラーモック
 * APIテスト時に使用されるコントローラーの代替実装
 */
import { Request, Response, NextFunction } from 'express';

/**
 * 決済コントローラーモック
 */
export const PaymentControllerMock = {
  /**
   * 決済意図作成のモック
   */
  createPaymentIntent: (req: Request, res: Response, next: NextFunction) => {
    res.json({
      clientSecret: 'test_client_secret',
      amount: 10000,
      currency: 'jpy'
    });
  },

  /**
   * 決済ステータス確認のモック
   */
  checkPaymentStatus: (req: Request, res: Response, next: NextFunction) => {
    res.json({
      orderId: req.params.orderId,
      status: 'succeeded',
      amount: 10000,
      currency: 'jpy'
    });
  },

  /**
   * ウェブフック処理のモック
   */
  handleWebhook: (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send('Webhook received');
  }
}; 