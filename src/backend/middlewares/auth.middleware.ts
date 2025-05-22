import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

// リクエストにユーザー情報を追加するために型拡張
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = {
  // トークン検証ミドルウェア
  verifyToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: '認証トークンがありません' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      
      // 型アサーションを使用してデコードされたトークンからユーザーIDを取得
      const userId = (decoded as any).id;
      
      // ユーザーをDBから取得
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'ユーザーが見つかりません' });
      }
      
      // リクエストオブジェクトにユーザー情報をセット
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: '無効なトークンです' });
    }
  },
  
  // 管理者権限検証ミドルウェア
  verifyAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ユーザー情報が既に設定されているか確認
      if (!req.user) {
        return res.status(401).json({ message: 'ユーザーが認証されていません' });
      }
      
      // 管理者権限を確認
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '管理者権限が必要です' });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  },

  // 任意のトークンチェック（ログインしていなくても利用可能）
  optionalToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        // トークンがなくても次のミドルウェアに進む
        return next();
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      
      // 型アサーションを使用してデコードされたトークンからユーザーIDを取得
      const userId = (decoded as any).id;
      
      // ユーザーをDBから取得
      const user = await User.findById(userId);
      
      if (user) {
        // リクエストオブジェクトにユーザー情報をセット
        req.user = user;
      }
      
      next();
    } catch (error) {
      // トークンが無効でも次のミドルウェアに進む
      next();
    }
  }
}; 