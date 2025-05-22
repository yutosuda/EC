import express from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const orderController = new OrderController();

// --- 認証済みユーザー向けAPI ---

// 注文を作成（認証済みユーザーのみ）
router.post('/', authMiddleware.verifyToken, orderController.createOrder);

// 自分の注文履歴を取得（認証済みユーザーのみ）
router.get('/my-orders', authMiddleware.verifyToken, orderController.getMyOrders);

// 注文詳細を取得（認証済みユーザーのみ - 自分の注文のみ）
router.get('/:id', authMiddleware.verifyToken, orderController.getOrderById);

// --- 以下は管理者向けAPI ---

// 全注文一覧を取得（管理者のみ）
router.get('/', authMiddleware.verifyAdmin, orderController.getAllOrders);

// 注文ステータスを更新（管理者のみ）
router.put('/:id/status', authMiddleware.verifyAdmin, orderController.updateOrderStatus);

export { router as orderRoutes }; 