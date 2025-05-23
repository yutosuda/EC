import { Router, Request, Response, NextFunction } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { 
  uploadProductImages, 
  uploadCategoryImage,
  handleUploadError 
} from '../middlewares/upload.middleware';

const router = Router();
const uploadController = new UploadController();

/**
 * @route POST /api/uploads/products
 * @desc 商品画像のアップロード（複数ファイル対応）
 * @access 管理者のみ
 */
router.post(
  '/products',
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  (req: Request, res: Response, next: NextFunction): void => {
    uploadProductImages(req, res, (error) => {
      if (error) {
        return handleUploadError(error, req, res, next);
      }
      next();
    });
  },
  uploadController.uploadProductImages.bind(uploadController)
);

/**
 * @route POST /api/uploads/categories
 * @desc カテゴリ画像のアップロード（単一ファイル）
 * @access 管理者のみ
 */
router.post(
  '/categories',
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  (req: Request, res: Response, next: NextFunction): void => {
    uploadCategoryImage(req, res, (error) => {
      if (error) {
        return handleUploadError(error, req, res, next);
      }
      next();
    });
  },
  uploadController.uploadCategoryImage.bind(uploadController)
);

/**
 * @route DELETE /api/uploads/:filename
 * @desc 画像ファイルの削除
 * @access 管理者のみ
 */
router.delete(
  '/:filename',
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  uploadController.deleteImage.bind(uploadController)
);

/**
 * @route GET /api/uploads/:filename/info
 * @desc 画像ファイル情報の取得
 * @access 管理者のみ
 */
router.get(
  '/:filename/info',
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  uploadController.getImageInfo.bind(uploadController)
);

/**
 * @route POST /api/uploads/cleanup
 * @desc 一時ファイルのクリーンアップ
 * @access 管理者のみ
 */
router.post(
  '/cleanup',
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  uploadController.cleanupTempFiles.bind(uploadController)
);

export default router; 