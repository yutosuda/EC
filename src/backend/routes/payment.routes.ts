import express from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();

// 決済意図（Payment Intent）の作成 - 認証必須
router.post('/create-payment-intent', 
  asyncHandler(authMiddleware.verifyToken), 
  asyncHandler(PaymentController.createPaymentIntent)
);

// 決済ステータスの確認 - 認証必須
router.get('/status/:orderId', 
  asyncHandler(authMiddleware.verifyToken), 
  asyncHandler(PaymentController.checkPaymentStatus)
);

// WebhookエンドポイントはStripeからのリクエストを受け付けるため認証なし
// また、Stripeからの生データを処理するため、expressのJSON parserを使用しない
router.post('/webhook', 
  express.raw({ type: 'application/json' }), 
  asyncHandler(PaymentController.handleWebhook)
);

export { router as paymentRoutes }; 