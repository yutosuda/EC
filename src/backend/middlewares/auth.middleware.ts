import { Request, Response, NextFunction, RequestHandler } from 'express';
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
  verifyToken: (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        res.status(401).json({ message: '認証トークンがありません' });
        return;
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      
      // 型アサーションを使用してデコードされたトークンからユーザーIDを取得
      const userId = (decoded as any).id;
      
      // ユーザーをDBから取得
      const user = await User.findById(userId);
      
      if (!user) {
        res.status(404).json({ message: 'ユーザーが見つかりません' });
        return;
      }
      
      // リクエストオブジェクトにユーザー情報をセット
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: '無効なトークンです' });
      return;
    }
  }) as RequestHandler,
  
  // 管理者権限検証ミドルウェア
  verifyAdmin: (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ユーザー情報が既に設定されているか確認
      if (!req.user) {
        res.status(401).json({ message: 'ユーザーが認証されていません' });
        return;
      }
      
      // 管理者権限を確認
      if (req.user.role !== 'admin') {
        res.status(403).json({ message: '管理者権限が必要です' });
        return;
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
      return;
    }
  }) as RequestHandler,

  // 任意のトークンチェック（ログインしていなくても利用可能）
  optionalToken: (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        // トークンがなくても次のミドルウェアに進む
        next();
        return;
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
  }) as RequestHandler
}; 