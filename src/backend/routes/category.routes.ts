import express from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const categoryController = new CategoryController();

// カテゴリ一覧を取得
router.get('/', categoryController.getAllCategories);

// カテゴリ詳細を取得
router.get('/:id', categoryController.getCategoryById);

// --- 以下は管理者向けAPI ---

// カテゴリを新規作成（管理者のみ）
router.post('/', authMiddleware.verifyAdmin, categoryController.createCategory);

// カテゴリを更新（管理者のみ）
router.put('/:id', authMiddleware.verifyAdmin, categoryController.updateCategory);

// カテゴリを削除（管理者のみ）
router.delete('/:id', authMiddleware.verifyAdmin, categoryController.deleteCategory);

export { router as categoryRoutes }; 