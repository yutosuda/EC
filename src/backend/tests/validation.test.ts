import * as validation from '../utils/validation.util';

describe('バリデーションユーティリティテスト', () => {
  describe('validateEmail', () => {
    test('有効なメールアドレスを検証', () => {
      expect(validation.validateEmail('test@example.com')).toBe(true);
      expect(validation.validateEmail('user.name+tag@example.co.jp')).toBe(true);
    });

    test('無効なメールアドレスを検証', () => {
      expect(validation.validateEmail('invalid')).toBe(false);
      expect(validation.validateEmail('user@')).toBe(false);
      expect(validation.validateEmail('@example.com')).toBe(false);
      expect(validation.validateEmail('user@.com')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    test('強力なパスワードを検証', () => {
      expect(validation.validatePasswordStrength('Password123')).toEqual({ valid: true });
      expect(validation.validatePasswordStrength('StrongP@ssw0rd')).toEqual({ valid: true });
    });

    test('短すぎるパスワードを検証', () => {
      expect(validation.validatePasswordStrength('Pas123')).toEqual({
        valid: false,
        message: 'パスワードは8文字以上である必要があります'
      });
    });

    test('大文字がないパスワードを検証', () => {
      expect(validation.validatePasswordStrength('password123')).toEqual({
        valid: false,
        message: 'パスワードには大文字を含める必要があります'
      });
    });

    test('小文字がないパスワードを検証', () => {
      expect(validation.validatePasswordStrength('PASSWORD123')).toEqual({
        valid: false,
        message: 'パスワードには小文字を含める必要があります'
      });
    });

    test('数字がないパスワードを検証', () => {
      expect(validation.validatePasswordStrength('PasswordTest')).toEqual({
        valid: false,
        message: 'パスワードには数字を含める必要があります'
      });
    });
  });

  describe('validateJapanesePhoneNumber', () => {
    test('有効な日本の電話番号を検証（ハイフンあり）', () => {
      expect(validation.validateJapanesePhoneNumber('03-1234-5678')).toBe(true);
      expect(validation.validateJapanesePhoneNumber('090-1234-5678')).toBe(true);
    });

    test('有効な日本の電話番号を検証（ハイフンなし）', () => {
      expect(validation.validateJapanesePhoneNumber('0312345678')).toBe(true);
      expect(validation.validateJapanesePhoneNumber('09012345678')).toBe(true);
    });

    test('無効な日本の電話番号を検証', () => {
      expect(validation.validateJapanesePhoneNumber('12345')).toBe(false);
      expect(validation.validateJapanesePhoneNumber('abc-defg-hijk')).toBe(false);
      expect(validation.validateJapanesePhoneNumber('090-123-45678')).toBe(false);
    });
  });

  describe('validateJapanesePostalCode', () => {
    test('有効な日本の郵便番号を検証（ハイフンあり）', () => {
      expect(validation.validateJapanesePostalCode('123-4567')).toBe(true);
    });

    test('有効な日本の郵便番号を検証（ハイフンなし）', () => {
      expect(validation.validateJapanesePostalCode('1234567')).toBe(true);
    });

    test('無効な日本の郵便番号を検証', () => {
      expect(validation.validateJapanesePostalCode('123-456')).toBe(false);
      expect(validation.validateJapanesePostalCode('1234-567')).toBe(false);
      expect(validation.validateJapanesePostalCode('abc-defg')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    test('有効な値を検証', () => {
      expect(validation.validateRequired('テスト')).toBe(true);
      expect(validation.validateRequired(123)).toBe(true);
      expect(validation.validateRequired(true)).toBe(true);
      expect(validation.validateRequired([1, 2, 3])).toBe(true);
      expect(validation.validateRequired({ key: 'value' })).toBe(true);
    });

    test('無効な値を検証', () => {
      expect(validation.validateRequired('')).toBe(false);
      expect(validation.validateRequired('   ')).toBe(false);
      expect(validation.validateRequired(null)).toBe(false);
      expect(validation.validateRequired(undefined)).toBe(false);
      expect(validation.validateRequired([])).toBe(false);
    });
  });

  describe('validateNumberRange', () => {
    test('範囲内の数値を検証', () => {
      expect(validation.validateNumberRange(5, 0, 10)).toBe(true);
      expect(validation.validateNumberRange(0, 0, 10)).toBe(true);
      expect(validation.validateNumberRange(10, 0, 10)).toBe(true);
    });

    test('最小値のみ指定で範囲内の数値を検証', () => {
      expect(validation.validateNumberRange(5, 0)).toBe(true);
      expect(validation.validateNumberRange(0, 0)).toBe(true);
    });

    test('最大値のみ指定で範囲内の数値を検証', () => {
      expect(validation.validateNumberRange(5, undefined, 10)).toBe(true);
      expect(validation.validateNumberRange(10, undefined, 10)).toBe(true);
    });

    test('範囲外の数値を検証', () => {
      expect(validation.validateNumberRange(-1, 0, 10)).toBe(false);
      expect(validation.validateNumberRange(11, 0, 10)).toBe(false);
    });
  });

  describe('validateSKU', () => {
    test('有効なSKUを検証', () => {
      expect(validation.validateSKU('ABC123')).toBe(true);
      expect(validation.validateSKU('ABC-123')).toBe(true);
      expect(validation.validateSKU('ABC_123')).toBe(true);
    });

    test('無効なSKUを検証', () => {
      expect(validation.validateSKU('ABC 123')).toBe(false);
      expect(validation.validateSKU('ABC@123')).toBe(false);
      expect(validation.validateSKU('ABC#123')).toBe(false);
    });
  });

  describe('validateObjectId', () => {
    test('有効なObjectIDを検証', () => {
      expect(validation.validateObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(validation.validateObjectId('507f1f77bcf86cd799439012')).toBe(true);
    });

    test('無効なObjectIDを検証', () => {
      expect(validation.validateObjectId('invalid')).toBe(false);
      expect(validation.validateObjectId('507f1f77bcf86cd79943901')).toBe(false); // 短すぎる
      expect(validation.validateObjectId('507f1f77bcf86cd7994390111')).toBe(false); // 長すぎる
      expect(validation.validateObjectId('507f1f77bcf86cd79943901g')).toBe(false); // 無効な文字
    });
  });

  describe('validateMaxLength', () => {
    test('最大長以内の文字列を検証', () => {
      expect(validation.validateMaxLength('テスト', 10)).toBe(true);
      expect(validation.validateMaxLength('', 10)).toBe(true);
      expect(validation.validateMaxLength('1234567890', 10)).toBe(true);
    });

    test('最大長を超える文字列を検証', () => {
      expect(validation.validateMaxLength('12345678901', 10)).toBe(false);
      expect(validation.validateMaxLength('テストテストテストテスト', 10)).toBe(false);
    });
  });

  describe('validateObject', () => {
    test('複合バリデーションで有効なオブジェクトを検証', () => {
      const obj = {
        email: 'test@example.com',
        password: 'Password123',
        age: 25
      };

      const rules = {
        email: validation.validateEmail,
        password: validation.validatePasswordStrength,
        age: (value: number) => validation.validateNumberRange(value, 18, 100)
      };

      const result = validation.validateObject(obj, rules);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('複合バリデーションで無効なオブジェクトを検証', () => {
      const obj = {
        email: 'invalid',
        password: 'weak',
        age: 15
      };

      const rules = {
        email: validation.validateEmail,
        password: validation.validatePasswordStrength,
        age: (value: number) => validation.validateNumberRange(value, 18, 100)
      };

      const result = validation.validateObject(obj, rules);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(3);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.age).toBeDefined();
    });
  });
}); 