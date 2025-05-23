import express from 'express';
import { QuotationController } from '../controllers/quotation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// 見積書を生成するエンドポイント（認証必須）
router.post('/generate', authMiddleware, QuotationController.generateQuotation);

// 見積書PDFを生成するエンドポイント（認証必須）
router.post('/generate-pdf', authMiddleware, QuotationController.generateQuotationPdf);

export { router as quotationRoutes }; 