import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { setupSwagger } from './utils/swagger';

// 環境変数の読み込み
dotenv.config();

/**
 * Expressアプリケーションの作成と設定
 * @param options アプリケーション設定オプション
 * @returns 設定済みのExpressアプリケーション
 */
const createApp = (options = { isTest: false }) => {
  // Expressアプリケーションの作成
  const app = express();

  // ミドルウェアの設定
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ルートハンドラー
  app.get('/', (req: Request, res: Response) => {
    res.json({ message: '建設資材ECサイトAPIサーバーが稼働中です' });
  });

  // テスト環境ではカスタムルーターを使用する可能性がある
  if (options.isTest) {
    // APIルート（テスト用）
    // 注意：モックルーターはテスト側で設定されます。
    // ここではAPIルートプレフィックスのみ設定し、各ルートは個別にテスト側で指定
    console.log('テスト環境でサーバーを起動しています');
    // テスト時には実際のapiRouterは使用せず、空のルーターを設定
    const emptyRouter = express.Router();
    app.use('/api', emptyRouter);
  } else {
    // 通常のAPIルート
    app.use('/api', apiRouter);
  }

  // Swagger APIドキュメント設定（開発環境のみ）
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  // 404ハンドラー - 存在しないルートに対するハンドラー
  app.use(notFoundHandler);

  // グローバルエラーハンドリングミドルウェア
  app.use(errorHandler);

  return app;
};

/**
 * データベース接続処理
 */
const connectDatabase = async () => {
  // MongoDB接続
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/construction-ec?authSource=admin';

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB接続成功');
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    process.exit(1);
  }
};

// サーバー起動処理（テスト時は実行しない）
if (process.env.NODE_ENV !== 'test') {
  // データベース接続
  connectDatabase();

  // アプリケーション作成
  const app = createApp();

  // サーバー起動
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
    console.log(`API ドキュメント: http://localhost:${PORT}/api-docs`);
  });
}

// テスト用にアプリケーションをエクスポート
export default createApp; 