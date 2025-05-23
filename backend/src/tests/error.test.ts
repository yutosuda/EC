import { 
  APIError, 
  ErrorCode, 
  convertToAPIError, 
  createAuthError,
  createValidationError,
  createNotFoundError,
  createConflictError,
  createInternalError
} from '../utils/error.util';

describe('エラーユーティリティテスト', () => {
  describe('APIError', () => {
    test('APIErrorインスタンスが正しく作成される', () => {
      const error = new APIError(ErrorCode.NOT_FOUND, 'リソースが見つかりません', { id: '123' });
      
      expect(error).toBeInstanceOf(APIError);
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('リソースが見つかりません');
      expect(error.details).toEqual({ id: '123' });
      expect(error.statusCode).toBe(404);
    });

    test('APIErrorのtoResponseメソッドが正しいレスポンス形式を返す', () => {
      const error = new APIError(ErrorCode.VALIDATION_ERROR, 'バリデーションエラー', { 
        errors: { email: '無効なメールアドレスです' } 
      });
      
      const response = error.toResponse();
      
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(response.error.message).toBe('バリデーションエラー');
      expect(response.error.details).toEqual({ errors: { email: '無効なメールアドレスです' } });
    });
  });

  describe('エラーヘルパー関数', () => {
    test('createValidationErrorが正しいAPIErrorを返す', () => {
      const validationErrors = { email: '無効なメールアドレスです', password: 'パスワードは必須です' };
      const error = createValidationError(validationErrors);
      
      expect(error).toBeInstanceOf(APIError);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ errors: validationErrors });
    });

    test('createAuthErrorが正しいAPIErrorを返す', () => {
      const error = createAuthError('認証に失敗しました');
      
      expect(error).toBeInstanceOf(APIError);
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('認証に失敗しました');
    });

    test('createAuthErrorがデフォルトメッセージを使用する', () => {
      const error = createAuthError();
      
      expect(error).toBeInstanceOf(APIError);
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.message).toBe('認証に失敗しました');
    });

    test('createNotFoundErrorが正しいAPIErrorを返す', () => {
      const error = createNotFoundError('ユーザー');
      
      expect(error).toBeInstanceOf(APIError);
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('ユーザーが見つかりません');
    });

    test('createConflictErrorが正しいAPIErrorを返す', () => {
      const error = createConflictError('メールアドレス', 'test@example.com');
      
      expect(error).toBeInstanceOf(APIError);
      expect(error.code).toBe(ErrorCode.ALREADY_EXISTS);
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('このメールアドレスは既に存在します');
      expect(error.details).toEqual({ identifier: 'test@example.com' });
    });

    test('createInternalErrorが正しいAPIErrorを返す', () => {
      const error = createInternalError('データベース接続に失敗しました');
      
      expect(error).toBeInstanceOf(APIError);
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('データベース接続に失敗しました');
    });

    test('createInternalErrorがデフォルトメッセージを使用する', () => {
      const error = createInternalError();
      
      expect(error).toBeInstanceOf(APIError);
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.message).toBe('サーバー内部でエラーが発生しました');
    });
  });

  describe('convertToAPIError', () => {
    test('既存のAPIErrorをそのまま返す', () => {
      const originalError = new APIError(ErrorCode.FORBIDDEN, 'アクセス権限がありません');
      const convertedError = convertToAPIError(originalError);
      
      expect(convertedError).toBe(originalError);
    });

    test('通常のErrorをAPIErrorに変換する', () => {
      const originalError = new Error('一般的なエラー');
      const convertedError = convertToAPIError(originalError);
      
      expect(convertedError).toBeInstanceOf(APIError);
      expect(convertedError.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(convertedError.message).toBe('一般的なエラー');
    });

    test('オブジェクトをAPIErrorに変換する', () => {
      const convertedError = convertToAPIError({ message: 'オブジェクトエラー' });
      
      expect(convertedError).toBeInstanceOf(APIError);
      expect(convertedError.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(convertedError.message).toBe('予期しないエラーが発生しました');
    });

    test('文字列をAPIErrorに変換する', () => {
      const convertedError = convertToAPIError('エラーメッセージ');
      
      expect(convertedError).toBeInstanceOf(APIError);
      expect(convertedError.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(convertedError.message).toBe('予期しないエラーが発生しました');
    });
  });
}); 