import { Request, Response, NextFunction, RequestHandler } from 'express';
import { APIError, convertToAPIError, ErrorCode } from '../utils/error.util';
import mongoose from 'mongoose';

// グローバルエラーハンドリングミドルウェア
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('エラー発生:', err);
  
  // APIエラーを変換
  let apiError: APIError;
  
  if (err instanceof APIError) {
    // 既にAPIErrorの場合はそのまま使用
    apiError = err;
  } else if (err instanceof mongoose.Error.ValidationError) {
    // Mongooseのバリデーションエラー
    const validationErrors: Record<string, string> = {};
    
    Object.keys(err.errors).forEach(key => {
      validationErrors[key] = err.errors[key].message;
    });
    
    apiError = convertToAPIError(err);
  } else if (err instanceof mongoose.Error.CastError) {
    // Mongooseのキャストエラー（主にObjectIDの変換失敗）
    apiError = new APIError(
      ErrorCode.INVALID_ID,
      '無効なIDフォーマットです',
      { path: err.path }
    );
  } else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    // Mongo一意制約違反エラー
    const keyValue = (err as any).keyValue;
    const duplicateKey = Object.keys(keyValue)[0];
    
    apiError = new APIError(
      ErrorCode.ALREADY_EXISTS,
      `この${duplicateKey}は既に使用されています`,
      { [duplicateKey]: keyValue[duplicateKey] }
    );
  } else {
    // その他のエラーはAPIErrorに変換
    apiError = convertToAPIError(err);
  }
  
  // 環境に応じたエラー詳細の制御
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // エラーレスポンスを返す
  const errorResponse = apiError.toResponse();
  
  // 開発環境でのみスタックトレースを含める
  if (isDevelopment && err.stack) {
    (errorResponse.error as any).stack = err.stack;
  }
  
  res.status(apiError.statusCode).json(errorResponse);
};

// 404エラーハンドラー
export const notFoundHandler = (req: Request, res: Response) => {
  const apiError = new APIError(
    ErrorCode.NOT_FOUND,
    'リクエストされたリソースが見つかりません',
    { path: req.originalUrl }
  );
  
  res.status(apiError.statusCode).json(apiError.toResponse());
};

// 非同期ルートハンドラーのラッパー
// コントローラーメソッドはPromise<Response>などを返す可能性があるが、
// Express.jsのRequestHandlerに適合させるためのラッパー
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Promise.resolveを使用してPromiseを確実に処理し、エラーをcatchしてnextに渡す
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 