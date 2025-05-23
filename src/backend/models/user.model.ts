import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// ユーザータイプの定義
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'user' | 'admin' | 'business';
  accountType: 'individual' | 'business';
  companyName?: string;
  department?: string;
  position?: string;
  businessType?: string;
  taxId?: string;
  isApproved?: boolean;
  specialPricing?: boolean;
  creditLimit?: number;
  paymentTerms?: string;
  addresses: {
    addressType: 'shipping' | 'billing';
    postalCode: string;
    prefecture: string;
    city: string;
    address1: string;
    address2?: string;
    isDefault: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ユーザースキーマ定義
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'メールアドレスは必須です'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'パスワードは必須です'],
      minlength: [8, 'パスワードは8文字以上である必要があります'],
    },
    firstName: {
      type: String,
      required: [true, '名前（名）は必須です'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, '名前（姓）は必須です'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, '電話番号は必須です'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'business'],
      default: 'user',
    },
    accountType: {
      type: String,
      enum: ['individual', 'business'],
      default: 'individual',
    },
    companyName: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    businessType: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    specialPricing: {
      type: Boolean,
      default: false,
    },
    creditLimit: {
      type: Number,
    },
    paymentTerms: {
      type: String,
    },
    addresses: [
      {
        addressType: {
          type: String,
          enum: ['shipping', 'billing'],
          required: true,
        },
        postalCode: {
          type: String,
          required: true,
        },
        prefecture: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        address1: {
          type: String,
          required: true,
        },
        address2: {
          type: String,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// パスワードをハッシュ化する前処理
userSchema.pre<IUser>('save', async function (next) {
  // パスワードが変更されていない場合はスキップ
  if (!this.isModified('password')) return next();

  try {
    // パスワードをハッシュ化
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// パスワード比較メソッド
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ユーザーモデルの作成とエクスポート
export const User = mongoose.model<IUser>('User', userSchema); 