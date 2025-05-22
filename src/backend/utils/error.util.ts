/**
 * エラーハンドリングユーティリティ
 * APIエラーの標準化と適切なレスポンス形式を提供
 */

// エラーコードとHTTPステータスコードの対応関係
export enum ErrorCode {
  // 認証・認可関連エラー
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // バリデーションエラー
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_ID = 'INVALID_ID',
  
  // リソース関連エラー
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // データベースエラー
  DB_ERROR = 'DB_ERROR',
  QUERY_FAILED = 'QUERY_FAILED',
  
  // その他のエラー
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

// エラーコードとHTTPステータスコードのマッピング
export const errorStatusMap: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.INVALID_ID]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.DB_ERROR]: 500,
  [ErrorCode.QUERY_FAILED]: 500,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429
};

// APIエラーのレスポンス型
export interface APIErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, any>;
  };
}

// カスタムAPIエラークラス
export class APIError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: Record<string, any>;
  
  constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = errorStatusMap[code];
    this.details = details;
  }
  
  // APIエラーレスポンスの形式に変換
  toResponse(): APIErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details
      }
    };
  }
}

// バリデーションエラー用のヘルパー関数
export const createValidationError = (errors: Record<string, string>): APIError => {
  return new APIError(
    ErrorCode.VALIDATION_ERROR,
    'リクエストデータのバリデーションに失敗しました',
    { errors }
  );
};

// 認証エラー用のヘルパー関数
export const createAuthError = (message: string = '認証に失敗しました'): APIError => {
  return new APIError(ErrorCode.UNAUTHORIZED, message);
};

// 権限エラー用のヘルパー関数
export const createForbiddenError = (message: string = 'このリソースにアクセスする権限がありません'): APIError => {
  return new APIError(ErrorCode.FORBIDDEN, message);
};

// リソース不在エラー用のヘルパー関数
export const createNotFoundError = (resource: string = 'リソース'): APIError => {
  return new APIError(ErrorCode.NOT_FOUND, `${resource}が見つかりません`);
};

// リソース重複エラー用のヘルパー関数
export const createConflictError = (resource: string, identifier: string): APIError => {
  return new APIError(
    ErrorCode.ALREADY_EXISTS,
    `この${resource}は既に存在します`,
    { identifier }
  );
};

// 内部サーバーエラー用のヘルパー関数
export const createInternalError = (message: string = 'サーバー内部でエラーが発生しました'): APIError => {
  return new APIError(ErrorCode.INTERNAL_ERROR, message);
};

// エラーをAPIエラーに変換する関数（汎用エラーハンドリング用）
export const convertToAPIError = (error: unknown): APIError => {
  if (error instanceof APIError) {
    return error;
  }
  
  // Mongooseのバリデーションエラー
  if (error instanceof Error && 'name' in error && error.name === 'ValidationError' && 'errors' in error) {
    const validationErrors: Record<string, string> = {};
    const mongooseError = error as any;
    
    Object.keys(mongooseError.errors).forEach(key => {
      validationErrors[key] = mongooseError.errors[key].message;
    });
    
    return createValidationError(validationErrors);
  }
  
  // 一般的なエラー
  const message = error instanceof Error ? error.message : '予期しないエラーが発生しました';
  return createInternalError(message);
}; 