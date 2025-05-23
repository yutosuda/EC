import { Request, Response, NextFunction } from 'express';
import { QuotationService } from '../services/quotation.service';
import { User } from '../models/user.model';

/**
 * 見積書コントローラー
 */
export class QuotationController {
  /**
   * カートの内容から見積書を生成
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  static async generateQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です',
        });
      }

      // ユーザーがビジネスアカウントかチェック
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ユーザーが見つかりません',
        });
      }
      
      // リクエストから見積書オプションを取得
      const { expiryDays, notes } = req.body;

      // 見積書を生成
      const quotationData = await QuotationService.generateQuotationFromCart(
        userId.toString(),
        expiryDays || 30,
        notes
      );

      // 生成された見積書データを返す
      res.status(200).json({
        success: true,
        quotation: quotationData,
      });
    } catch (error: any) {
      // エラー処理
      if (error.message === 'カートが空です') {
        return res.status(400).json({
          success: false,
          message: '見積書を作成するためにはカートに商品を追加してください',
        });
      }
      
      next(error);
    }
  }

  /**
   * 見積書のPDF生成
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  static async generateQuotationPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です',
        });
      }

      // リクエストから見積書オプションを取得
      const { expiryDays, notes } = req.body;

      // 見積書データを生成
      const quotationData = await QuotationService.generateQuotationFromCart(
        userId.toString(),
        expiryDays || 30,
        notes
      );

      // PDFの生成は将来対応
      // 現在は見積書データをJSON形式で返す
      res.status(200).json({
        success: true,
        message: 'PDF生成機能は現在開発中です。見積書データをJSONで返します。',
        quotation: quotationData,
      });
    } catch (error) {
      next(error);
    }
  }
} 