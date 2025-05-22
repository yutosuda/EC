/**
 * バリデーションユーティリティ
 * 様々な入力データのバリデーションを行う関数群
 */

// メールアドレスのバリデーション
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// パスワード強度のチェック（8文字以上、英大文字、英小文字、数字を含む）
export const validatePasswordStrength = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'パスワードは8文字以上である必要があります' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'パスワードには大文字を含める必要があります' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'パスワードには小文字を含める必要があります' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: 'パスワードには数字を含める必要があります' };
  }
  
  return { valid: true };
};

// 日本の電話番号のバリデーション
export const validateJapanesePhoneNumber = (phoneNumber: string): boolean => {
  // ハイフンあり・なしの両方に対応
  const phoneRegex = /^(0\d{1,4}-\d{1,4}-\d{4}|\d{10,11})$/;
  return phoneRegex.test(phoneNumber);
};

// 日本の郵便番号のバリデーション
export const validateJapanesePostalCode = (postalCode: string): boolean => {
  // ハイフンあり・なしの両方に対応
  const postalCodeRegex = /^(\d{3}-\d{4}|\d{7})$/;
  return postalCodeRegex.test(postalCode);
};

// 必須フィールドのチェック
export const validateRequired = (value: any): boolean => {
  if (value === undefined || value === null) {
    return false;
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return false;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  
  return true;
};

// 数値の範囲チェック
export const validateNumberRange = (value: number, min?: number, max?: number): boolean => {
  if (min !== undefined && value < min) {
    return false;
  }
  
  if (max !== undefined && value > max) {
    return false;
  }
  
  return true;
};

// SKUの形式チェック（英数字とハイフン、アンダースコアのみ）
export const validateSKU = (sku: string): boolean => {
  const skuRegex = /^[a-zA-Z0-9_-]+$/;
  return skuRegex.test(sku);
};

// ObjectIDのバリデーション
export const validateObjectId = (id: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// 検索クエリのサニタイズ（XSS対策）
export const sanitizeQuery = (query: string): string => {
  return query.replace(/[<>]/g, '');
};

// 文字列の最大長チェック
export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

// 複合バリデーション（複数の条件を一度にチェック）
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const validateObject = (obj: Record<string, any>, validationRules: Record<string, (value: any) => boolean | { valid: boolean; message?: string }>): ValidationResult => {
  const result: ValidationResult = { valid: true, errors: {} };
  
  for (const [field, validator] of Object.entries(validationRules)) {
    const value = obj[field];
    const validationResult = validator(value);
    
    if (typeof validationResult === 'boolean') {
      if (!validationResult) {
        result.valid = false;
        result.errors[field] = `${field}が無効です`;
      }
    } else {
      if (!validationResult.valid) {
        result.valid = false;
        result.errors[field] = validationResult.message || `${field}が無効です`;
      }
    }
  }
  
  return result;
}; 