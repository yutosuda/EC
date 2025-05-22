import express from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const productController = new ProductController();

// 商品一覧を取得
router.get('/', productController.getAllProducts);

// 商品詳細を取得
router.get('/:id', productController.getProductById);

// 商品をカテゴリで検索
router.get('/category/:categoryId', productController.getProductsByCategory);

// 商品を検索
router.get('/search/:query', productController.searchProducts);

// --- 以下は管理者向けAPI ---

// 商品を新規作成（管理者のみ）
router.post('/', authMiddleware.verifyAdmin, productController.createProduct);

// 商品を更新（管理者のみ）
router.put('/:id', authMiddleware.verifyAdmin, productController.updateProduct);

// 商品を削除（管理者のみ）
router.delete('/:id', authMiddleware.verifyAdmin, productController.deleteProduct);

export { router as productRoutes }; 