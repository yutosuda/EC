import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// アップロード先ディレクトリの作成
const ensureUploadDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 画像ファイルタイプの検証
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  // 許可する画像形式
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('画像ファイルのみアップロード可能です。(JPEG, PNG, GIF, WebP)'));
  }
};

// ストレージ設定
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    ensureUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // ファイル名の生成: timestamp_randomstring.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${fileExtension}`);
  }
});

// 基本的なアップロード設定
const uploadConfig = {
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB制限
    files: 10 // 最大10ファイル
  }
};

// 単一ファイルアップロード用
export const uploadSingle = multer(uploadConfig).single('image');

// 複数ファイルアップロード用
export const uploadMultiple = multer(uploadConfig).array('images', 10);

// エラーハンドリング用ミドルウェア
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'ファイルサイズが大きすぎます。5MB以下にしてください。'
      });
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'アップロード可能なファイル数を超えています。最大10ファイルまでです。'
      });
      return;
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        message: '予期しないフィールドです。'
      });
      return;
    }
  }

  if (error.message.includes('画像ファイルのみ')) {
    res.status(400).json({
      success: false,
      message: error.message
    });
    return;
  }

  next(error);
};

// 商品画像アップロード用（複数画像）
export const uploadProductImages = multer({
  ...uploadConfig,
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'products');
      ensureUploadDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      cb(null, `product_${uniqueSuffix}${fileExtension}`);
    }
  })
}).array('images', 10);

// カテゴリ画像アップロード用（単一画像）
export const uploadCategoryImage = multer({
  ...uploadConfig,
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'categories');
      ensureUploadDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      cb(null, `category_${uniqueSuffix}${fileExtension}`);
    }
  })
}).single('image'); 