import express from 'express';
import { QuotationController } from '../controllers/quotation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = express.Router();

// 見積書を生成するエンドポイント（認証必須）
router.post('/generate', 
  authMiddleware.verifyToken, 
  asyncHandler(QuotationController.generateQuotation)
);

// 見積書PDFを生成するエンドポイント（認証必須）
router.post('/generate-pdf', 
  authMiddleware.verifyToken, 
  asyncHandler(QuotationController.generateQuotationPdf)
);

export { router as quotationRoutes }; 