import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authValidation } from '../middlewares/validation.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();
const authController = new AuthController();

// ユーザー登録
router.post('/register', authValidation.register, asyncHandler(authController.register));

// ログイン
router.post('/login', authValidation.login, asyncHandler(authController.login));

// 現在のユーザー情報を取得
router.get('/me', authMiddleware.verifyToken, asyncHandler(authController.getCurrentUser));

// パスワード変更
router.put('/change-password', 
  authMiddleware.verifyToken, 
  authValidation.changePassword, 
  asyncHandler(authController.changePassword)
);

// パスワードリセットリクエスト
router.post('/reset-password-request', 
  authValidation.resetPasswordRequest,
  asyncHandler(authController.resetPasswordRequest)
);

// パスワードリセット
router.post('/reset-password', 
  authValidation.resetPassword,
  asyncHandler(authController.resetPassword)
);

export { router as authRoutes }; 