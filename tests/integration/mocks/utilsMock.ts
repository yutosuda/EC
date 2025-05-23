/**
 * バックエンドユーティリティのモック
 * テスト時に必要なユーティリティ関数をモック化
 */

/**
 * エラーコード列挙型
 */
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_ID = 'INVALID_ID',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  DB_ERROR = 'DB_ERROR',
  QUERY_FAILED = 'QUERY_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

/**
 * APIエラークラスのモック
 */
export class APIError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: Record<string, any>;
  
  constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = 500; // デフォルトは500
    
    // エラーコードに応じたステータスコードの設定
    switch (code) {
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.INVALID_TOKEN:
      case ErrorCode.TOKEN_EXPIRED:
        this.statusCode = 401;
        break;
      case ErrorCode.FORBIDDEN:
        this.statusCode = 403;
        break;
      case ErrorCode.VALIDATION_ERROR:
      case ErrorCode.INVALID_INPUT:
      case ErrorCode.INVALID_ID:
        this.statusCode = 400;
        break;
      case ErrorCode.NOT_FOUND:
        this.statusCode = 404;
        break;
      case ErrorCode.ALREADY_EXISTS:
      case ErrorCode.CONFLICT:
        this.statusCode = 409;
        break;
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        this.statusCode = 429;
        break;
      case ErrorCode.EXTERNAL_SERVICE_ERROR:
        this.statusCode = 502;
        break;
    }
    
    this.details = details;
  }
  
  /**
   * APIエラーレスポンスの形式に変換
   */
  toResponse() {
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

/**
 * APIエラー変換関数のモック
 */
export const convertToAPIError = (error: unknown): APIError => {
  if (error instanceof APIError) {
    return error;
  }
  
  const message = error instanceof Error ? error.message : '予期しないエラーが発生しました';
  return new APIError(ErrorCode.INTERNAL_ERROR, message);
}; 