import { Request, Response } from 'express';
import { validate, authValidation, productValidation } from '../middlewares/validation.middleware';
import * as validationUtil from '../utils/validation.util';
import { createValidationError } from '../utils/error.util';

// モックの準備
jest.mock('../utils/validation.util');
jest.mock('../utils/error.util');

describe('バリデーションミドルウェアテスト', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();

    // モックのリセット
    jest.clearAllMocks();
  });

  describe('validate関数', () => {
    test('バリデーションが成功するとnextが呼ばれる', () => {
      const validationFn = jest.fn().mockReturnValue({ valid: true, errors: {} });
      const middleware = validate(validationFn);

      middleware(req as Request, res as Response, next);

      expect(validationFn).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('バリデーションが失敗するとエラーレスポンスを返す', () => {
      const errors = { email: 'メールアドレスは必須です' };
      const validationFn = jest.fn().mockReturnValue({ valid: false, errors });
      const errorInstance = { 
        statusCode: 400, 
        toResponse: jest.fn().mockReturnValue({ success: false, error: { message: 'バリデーションエラー' } })
      };
      
      (createValidationError as jest.Mock).mockReturnValue(errorInstance);
      
      const middleware = validate(validationFn);
      middleware(req as Request, res as Response, next);

      expect(validationFn).toHaveBeenCalledWith(req);
      expect(createValidationError).toHaveBeenCalledWith(errors);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'バリデーションエラー' } });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authValidation', () => {
    beforeEach(() => {
      // 必要に応じて基本的なバリデーション関数をモック
      (validationUtil.validateRequired as jest.Mock).mockImplementation(val => !!val);
      (validationUtil.validateEmail as jest.Mock).mockReturnValue(true);
      (validationUtil.validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true });
      (validationUtil.validateJapanesePhoneNumber as jest.Mock).mockReturnValue(true);
    });

    describe('register', () => {
      test('必要なフィールドがあればバリデーションに成功する', () => {
        req.body = {
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'テスト',
          lastName: 'ユーザー',
          phoneNumber: '090-1234-5678'
        };

        authValidation.register(req as Request, res as Response, next);
        expect(next).toHaveBeenCalled();
      });

      test('必要なフィールドが不足している場合、バリデーションに失敗する', () => {
        req.body = {
          email: 'test@example.com',
          // パスワードが不足している
          firstName: 'テスト',
          lastName: 'ユーザー',
          phoneNumber: '090-1234-5678'
        };

        (validationUtil.validateRequired as jest.Mock)
          .mockImplementation(val => val === 'test@example.com' || val === 'テスト' || val === 'ユーザー' || val === '090-1234-5678');

        authValidation.register(req as Request, res as Response, next);
        expect(res.status).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
      });

      test('メールアドレスが無効な場合、バリデーションに失敗する', () => {
        req.body = {
          email: 'invalid-email',
          password: 'Password123',
          firstName: 'テスト',
          lastName: 'ユーザー',
          phoneNumber: '090-1234-5678'
        };

        (validationUtil.validateRequired as jest.Mock).mockReturnValue(true);
        (validationUtil.validateEmail as jest.Mock).mockReturnValue(false);

        authValidation.register(req as Request, res as Response, next);
        expect(res.status).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('login', () => {
      test('必要なフィールドがあればバリデーションに成功する', () => {
        req.body = {
          email: 'test@example.com',
          password: 'Password123'
        };

        authValidation.login(req as Request, res as Response, next);
        expect(next).toHaveBeenCalled();
      });

      test('メールアドレスが不足している場合、バリデーションに失敗する', () => {
        req.body = {
          password: 'Password123'
        };

        (validationUtil.validateRequired as jest.Mock)
          .mockImplementation(val => val === 'Password123');

        authValidation.login(req as Request, res as Response, next);
        expect(res.status).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('productValidation', () => {
    beforeEach(() => {
      // 必要に応じて基本的なバリデーション関数をモック
      (validationUtil.validateRequired as jest.Mock).mockImplementation(val => !!val);
      (validationUtil.validateNumberRange as jest.Mock).mockReturnValue(true);
      (validationUtil.validateSKU as jest.Mock).mockReturnValue(true);
      (validationUtil.validateObjectId as jest.Mock).mockReturnValue(true);
      (validationUtil.validateMaxLength as jest.Mock).mockReturnValue(true);
    });

    describe('create', () => {
      test('必要なフィールドがあればバリデーションに成功する', () => {
        req.body = {
          name: '商品名',
          description: '説明',
          price: 1000,
          sku: 'SKU123',
          category: '507f1f77bcf86cd799439011',
          manufacturer: 'メーカー'
        };

        productValidation.create(req as Request, res as Response, next);
        expect(next).toHaveBeenCalled();
      });

      test('必要なフィールドが不足している場合、バリデーションに失敗する', () => {
        req.body = {
          name: '商品名',
          description: '説明',
          // 価格が不足している
          sku: 'SKU123',
          category: '507f1f77bcf86cd799439011',
          manufacturer: 'メーカー'
        };

        (validationUtil.validateRequired as jest.Mock)
          .mockImplementation(val => val === '商品名' || val === '説明' || val === 'SKU123' || 
                              val === '507f1f77bcf86cd799439011' || val === 'メーカー');

        productValidation.create(req as Request, res as Response, next);
        expect(res.status).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('validateId', () => {
      test('有効なIDならバリデーションに成功する', () => {
        req.params = { id: '507f1f77bcf86cd799439011' };

        productValidation.validateId(req as Request, res as Response, next);
        expect(next).toHaveBeenCalled();
      });

      test('無効なIDならバリデーションに失敗する', () => {
        req.params = { id: 'invalid-id' };
        (validationUtil.validateObjectId as jest.Mock).mockReturnValue(false);

        productValidation.validateId(req as Request, res as Response, next);
        expect(res.status).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
      });
    });
  });
}); 