import express from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();
const categoryController = new CategoryController();

// カテゴリ一覧を取得
router.get('/', asyncHandler(categoryController.getAllCategories));

// カテゴリ詳細を取得
router.get('/:id', asyncHandler(categoryController.getCategoryById));

// --- 以下は管理者向けAPI ---

// カテゴリを新規作成（管理者のみ）
router.post('/', 
  asyncHandler(authMiddleware.verifyToken), 
  asyncHandler(authMiddleware.verifyAdmin), 
  asyncHandler(categoryController.createCategory)
);

// カテゴリを更新（管理者のみ）
router.put('/:id', 
  asyncHandler(authMiddleware.verifyToken), 
  asyncHandler(authMiddleware.verifyAdmin), 
  asyncHandler(categoryController.updateCategory)
);

// カテゴリを削除（管理者のみ）
router.delete('/:id', 
  asyncHandler(authMiddleware.verifyToken), 
  asyncHandler(authMiddleware.verifyAdmin), 
  asyncHandler(categoryController.deleteCategory)
);

export { router as categoryRoutes }; 