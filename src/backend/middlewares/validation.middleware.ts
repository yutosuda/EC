import { Request, Response, NextFunction } from 'express';
import { validateEmail, validatePasswordStrength, validateJapanesePhoneNumber, 
  validateJapanesePostalCode, validateRequired, validateNumberRange, 
  validateSKU, validateObjectId, validateMaxLength, validateObject } from '../utils/validation.util';
import { createValidationError } from '../utils/error.util';

// バリデーションミドルウェアのファクトリ関数
export const validate = (validationFn: (req: Request) => { valid: boolean; errors: Record<string, string> }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = validationFn(req);
    
    if (!validation.valid) {
      const error = createValidationError(validation.errors);
      return res.status(error.statusCode).json(error.toResponse());
    }
    
    next();
  };
};

// 認証関連のバリデーション
export const authValidation = {
  register: validate((req) => {
    const { email, password, firstName, lastName, phoneNumber } = req.body;
    const errors: Record<string, string> = {};
    
    if (!validateRequired(email)) {
      errors.email = 'メールアドレスは必須です';
    } else if (!validateEmail(email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!validateRequired(password)) {
      errors.password = 'パスワードは必須です';
    } else {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.message || 'パスワードが要件を満たしていません';
      }
    }
    
    if (!validateRequired(firstName)) {
      errors.firstName = '名前（名）は必須です';
    }
    
    if (!validateRequired(lastName)) {
      errors.lastName = '名前（姓）は必須です';
    }
    
    if (!validateRequired(phoneNumber)) {
      errors.phoneNumber = '電話番号は必須です';
    } else if (!validateJapanesePhoneNumber(phoneNumber)) {
      errors.phoneNumber = '有効な電話番号を入力してください';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
  
  login: validate((req) => {
    const { email, password } = req.body;
    const errors: Record<string, string> = {};
    
    if (!validateRequired(email)) {
      errors.email = 'メールアドレスは必須です';
    } else if (!validateEmail(email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!validateRequired(password)) {
      errors.password = 'パスワードは必須です';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
  
  changePassword: validate((req) => {
    const { currentPassword, newPassword } = req.body;
    const errors: Record<string, string> = {};
    
    if (!validateRequired(currentPassword)) {
      errors.currentPassword = '現在のパスワードは必須です';
    }
    
    if (!validateRequired(newPassword)) {
      errors.newPassword = '新しいパスワードは必須です';
    } else {
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        errors.newPassword = passwordValidation.message || '新しいパスワードが要件を満たしていません';
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
  
  resetPasswordRequest: validate((req) => {
    const { email } = req.body;
    const errors: Record<string, string> = {};
    
    if (!validateRequired(email)) {
      errors.email = 'メールアドレスは必須です';
    } else if (!validateEmail(email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
  
  resetPassword: validate((req) => {
    const { token, newPassword } = req.body;
    const errors: Record<string, string> = {};
    
    if (!validateRequired(token)) {
      errors.token = 'トークンは必須です';
    }
    
    if (!validateRequired(newPassword)) {
      errors.newPassword = '新しいパスワードは必須です';
    } else {
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        errors.newPassword = passwordValidation.message || '新しいパスワードが要件を満たしていません';
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
};

// 商品関連のバリデーション
export const productValidation = {
  create: validate((req) => {
    const {
      name,
      description,
      price,
      comparePrice,
      sku,
      category,
      manufacturer,
      stock,
    } = req.body;
    
    const errors: Record<string, string> = {};
    
    if (!validateRequired(name)) {
      errors.name = '商品名は必須です';
    } else if (!validateMaxLength(name, 200)) {
      errors.name = '商品名は200文字以内で入力してください';
    }
    
    if (!validateRequired(description)) {
      errors.description = '商品説明は必須です';
    }
    
    if (!validateRequired(price)) {
      errors.price = '価格は必須です';
    } else if (!validateNumberRange(Number(price), 0)) {
      errors.price = '価格は0以上である必要があります';
    }
    
    if (comparePrice !== undefined && !validateNumberRange(Number(comparePrice), 0)) {
      errors.comparePrice = '参考価格は0以上である必要があります';
    }
    
    if (!validateRequired(sku)) {
      errors.sku = 'SKUは必須です';
    } else if (!validateSKU(sku)) {
      errors.sku = 'SKUは英数字、ハイフン、アンダースコアのみ使用できます';
    }
    
    if (!validateRequired(category)) {
      errors.category = 'カテゴリは必須です';
    } else if (!validateObjectId(category)) {
      errors.category = '無効なカテゴリIDです';
    }
    
    if (!validateRequired(manufacturer)) {
      errors.manufacturer = 'メーカーは必須です';
    }
    
    if (stock !== undefined && !validateNumberRange(Number(stock), 0)) {
      errors.stock = '在庫数は0以上である必要があります';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
  
  update: validate((req) => {
    const {
      name,
      description,
      price,
      comparePrice,
      sku,
      category,
      manufacturer,
      stock,
    } = req.body;
    
    const errors: Record<string, string> = {};
    
    if (name !== undefined && !validateMaxLength(name, 200)) {
      errors.name = '商品名は200文字以内で入力してください';
    }
    
    if (price !== undefined && !validateNumberRange(Number(price), 0)) {
      errors.price = '価格は0以上である必要があります';
    }
    
    if (comparePrice !== undefined && !validateNumberRange(Number(comparePrice), 0)) {
      errors.comparePrice = '参考価格は0以上である必要があります';
    }
    
    if (sku !== undefined && !validateSKU(sku)) {
      errors.sku = 'SKUは英数字、ハイフン、アンダースコアのみ使用できます';
    }
    
    if (category !== undefined && !validateObjectId(category)) {
      errors.category = '無効なカテゴリIDです';
    }
    
    if (stock !== undefined && !validateNumberRange(Number(stock), 0)) {
      errors.stock = '在庫数は0以上である必要があります';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
  
  validateId: validate((req) => {
    const { id } = req.params;
    const errors: Record<string, string> = {};
    
    if (!validateObjectId(id)) {
      errors.id = '無効な商品IDです';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
};

// カテゴリ関連のバリデーション
export const categoryValidation = {
  create: validate((req) => {
    const { name, description, slug } = req.body;
    const errors: Record<string, string> = {};
    
    if (!validateRequired(name)) {
      errors.name = 'カテゴリ名は必須です';
    }
    
    if (!validateRequired(slug)) {
      errors.slug = 'スラッグは必須です';
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.slug = 'スラッグは小文字の英数字とハイフンのみ使用できます';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
  
  update: validate((req) => {
    const { slug } = req.body;
    const errors: Record<string, string> = {};
    
    if (slug !== undefined && !/^[a-z0-9-]+$/.test(slug)) {
      errors.slug = 'スラッグは小文字の英数字とハイフンのみ使用できます';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
  
  validateId: validate((req) => {
    const { id } = req.params;
    const errors: Record<string, string> = {};
    
    if (!validateObjectId(id)) {
      errors.id = '無効なカテゴリIDです';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
};

// 注文関連のバリデーション
export const orderValidation = {
  create: validate((req) => {
    const { 
      items, 
      shippingAddress,
      billingAddress,
      paymentMethod
    } = req.body;
    
    const errors: Record<string, string> = {};
    
    if (!validateRequired(items) || !Array.isArray(items) || items.length === 0) {
      errors.items = '注文商品は必須です';
    } else {
      // 商品項目のバリデーション
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.product || !validateObjectId(item.product)) {
          errors[`items[${i}].product`] = '無効な商品IDです';
        }
        if (!validateRequired(item.quantity) || !validateNumberRange(Number(item.quantity), 1)) {
          errors[`items[${i}].quantity`] = '数量は1以上である必要があります';
        }
      }
    }
    
    // 配送先住所のバリデーション
    if (!validateRequired(shippingAddress)) {
      errors.shippingAddress = '配送先住所は必須です';
    } else {
      if (!validateRequired(shippingAddress.postalCode)) {
        errors['shippingAddress.postalCode'] = '郵便番号は必須です';
      } else if (!validateJapanesePostalCode(shippingAddress.postalCode)) {
        errors['shippingAddress.postalCode'] = '有効な郵便番号を入力してください';
      }
      
      if (!validateRequired(shippingAddress.prefecture)) {
        errors['shippingAddress.prefecture'] = '都道府県は必須です';
      }
      
      if (!validateRequired(shippingAddress.city)) {
        errors['shippingAddress.city'] = '市区町村は必須です';
      }
      
      if (!validateRequired(shippingAddress.address1)) {
        errors['shippingAddress.address1'] = '住所は必須です';
      }
    }
    
    // 請求先住所のバリデーション（必要な場合）
    if (billingAddress) {
      if (!validateRequired(billingAddress.postalCode)) {
        errors['billingAddress.postalCode'] = '郵便番号は必須です';
      } else if (!validateJapanesePostalCode(billingAddress.postalCode)) {
        errors['billingAddress.postalCode'] = '有効な郵便番号を入力してください';
      }
      
      if (!validateRequired(billingAddress.prefecture)) {
        errors['billingAddress.prefecture'] = '都道府県は必須です';
      }
      
      if (!validateRequired(billingAddress.city)) {
        errors['billingAddress.city'] = '市区町村は必須です';
      }
      
      if (!validateRequired(billingAddress.address1)) {
        errors['billingAddress.address1'] = '住所は必須です';
      }
    }
    
    // 支払い方法のバリデーション
    if (!validateRequired(paymentMethod)) {
      errors.paymentMethod = '支払い方法は必須です';
    } else if (!['credit_card', 'bank_transfer', 'convenience_store', 'cod'].includes(paymentMethod)) {
      errors.paymentMethod = '無効な支払い方法です';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
  
  validateId: validate((req) => {
    const { id } = req.params;
    const errors: Record<string, string> = {};
    
    if (!validateObjectId(id)) {
      errors.id = '無効な注文IDです';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
  
  updateStatus: validate((req) => {
    const { status } = req.body;
    const errors: Record<string, string> = {};
    
    if (!validateRequired(status)) {
      errors.status = '注文ステータスは必須です';
    } else if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      errors.status = '無効な注文ステータスです';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }),
}; 