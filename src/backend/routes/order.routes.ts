import express from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();
const orderController = new OrderController();

// --- 認証済みユーザー向けAPI ---

// 注文を作成（認証済みユーザーのみ）
router.post('/', 
  asyncHandler(authMiddleware.verifyToken), 
  asyncHandler(orderController.createOrder)
);

// 自分の注文履歴を取得（認証済みユーザーのみ）
router.get('/my-orders', 
  asyncHandler(authMiddleware.verifyToken), 
  asyncHandler(orderController.getMyOrders)
);

// 注文詳細を取得（認証済みユーザーのみ - 自分の注文のみ）
router.get('/:id', 
  asyncHandler(authMiddleware.verifyToken), 
  asyncHandler(orderController.getOrderById)
);

// --- 以下は管理者向けAPI ---

// 全注文一覧を取得（管理者のみ）
router.get('/', 
  asyncHandler(authMiddleware.verifyToken),
  asyncHandler(authMiddleware.verifyAdmin), 
  asyncHandler(orderController.getAllOrders)
);

// 注文ステータスを更新（管理者のみ）
router.put('/:id/status', 
  asyncHandler(authMiddleware.verifyToken),
  asyncHandler(authMiddleware.verifyAdmin), 
  asyncHandler(orderController.updateOrderStatus)
);

export { router as orderRoutes }; 