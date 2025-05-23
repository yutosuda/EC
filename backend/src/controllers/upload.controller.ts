import { Request, Response } from 'express';
import { imageService } from '../services/image.service';
import path from 'path';

interface UploadRequest extends Request {
  files?: Express.Multer.File[];
  file?: Express.Multer.File;
}

export class UploadController {
  /**
   * 商品画像のアップロード（複数ファイル対応）
   */
  uploadProductImages = async (req: UploadRequest, res: Response): Promise<Response | void> => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'アップロードする画像ファイルが選択されていません'
        });
      }

      const processedImages: any[] = [];
      const errors: string[] = [];

      for (const file of files) {
        try {
          // 画像バリデーション
          const validation = await imageService.validateImage(file.path);
          if (!validation.valid) {
            errors.push(`${file.originalname}: ${validation.error}`);
            continue;
          }

          // ファイル名の基本部分を取得
          const baseName = path.parse(file.filename).name;

          // 複数サイズの画像を生成
          const processedSizes = await imageService.generateMultipleSizes(
            file.path,
            baseName,
            'product'
          );

          // WebP形式でも保存
          const webpPath = path.join(
            path.dirname(file.path).replace('uploads', 'uploads/processed'),
            `${baseName}_webp.webp`
          );
          const webpInfo = await imageService.optimizeForWeb(file.path, webpPath);

          processedImages.push({
            original: {
              filename: file.filename,
              originalName: file.originalname,
              path: file.path,
              size: file.size,
              mimetype: file.mimetype
            },
            processed: processedSizes,
            webp: webpInfo,
            url: `/uploads/products/${file.filename}`,
            thumbnailUrl: `/uploads/processed/products/${baseName}_thumbnail.jpg`,
            largeUrl: `/uploads/processed/products/${baseName}_large.jpg`
          });

        } catch (error) {
          console.error(`画像処理エラー (${file.originalname}):`, error);
          errors.push(`${file.originalname}: 画像処理に失敗しました`);
        }
      }

      // レスポンス作成
      const response: any = {
        success: true,
        message: `${processedImages.length}件の画像がアップロードされました`,
        images: processedImages
      };

      if (errors.length > 0) {
        response.errors = errors;
        response.message += ` (${errors.length}件のエラーがありました)`;
      }

      return res.status(200).json(response);

    } catch (error) {
      console.error('商品画像アップロードエラー:', error);
      return res.status(500).json({
        success: false,
        message: '画像のアップロードに失敗しました'
      });
    }
  };

  /**
   * カテゴリ画像のアップロード（単一ファイル）
   */
  uploadCategoryImage = async (req: UploadRequest, res: Response): Promise<Response | void> => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'アップロードする画像ファイルが選択されていません'
        });
      }

      // 画像バリデーション
      const validation = await imageService.validateImage(file.path);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }

      // ファイル名の基本部分を取得
      const baseName = path.parse(file.filename).name;

      // 複数サイズの画像を生成
      const processedSizes = await imageService.generateMultipleSizes(
        file.path,
        baseName,
        'category'
      );

      // WebP形式でも保存
      const webpPath = path.join(
        path.dirname(file.path).replace('uploads', 'uploads/processed'),
        `${baseName}_webp.webp`
      );
      const webpInfo = await imageService.optimizeForWeb(file.path, webpPath);

      return res.status(200).json({
        success: true,
        message: 'カテゴリ画像がアップロードされました',
        image: {
          original: {
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
          },
          processed: processedSizes,
          webp: webpInfo,
          url: `/uploads/categories/${file.filename}`,
          thumbnailUrl: `/uploads/processed/categories/${baseName}_thumbnail.jpg`,
          largeUrl: `/uploads/processed/categories/${baseName}_large.jpg`
        }
      });

    } catch (error) {
      console.error('カテゴリ画像アップロードエラー:', error);
      return res.status(500).json({
        success: false,
        message: '画像のアップロードに失敗しました'
      });
    }
  };

  /**
   * 画像の削除
   */
  deleteImage = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'ファイル名が指定されていません'
        });
      }

      // 各ディレクトリから画像ファイルを削除
      const directories = [
        'uploads/products',
        'uploads/categories',
        'uploads/processed/products',
        'uploads/processed/categories'
      ];

      let deletedCount = 0;

      for (const dir of directories) {
        const imagePath = path.join(process.cwd(), dir, filename);
        const deleted = await imageService.deleteImage(imagePath);
        if (deleted) deletedCount++;

        // 関連する処理済み画像も削除（サイズ違い、WebP）
        const baseName = path.parse(filename).name;
        const relatedFiles = [
          `${baseName}_large.jpg`,
          `${baseName}_medium.jpg`,
          `${baseName}_small.jpg`,
          `${baseName}_thumbnail.jpg`,
          `${baseName}_webp.webp`
        ];

        for (const relatedFile of relatedFiles) {
          const relatedPath = path.join(process.cwd(), dir, relatedFile);
          await imageService.deleteImage(relatedPath);
        }
      }

      if (deletedCount > 0) {
        return res.status(200).json({
          success: true,
          message: '画像が削除されました'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: '指定された画像ファイルが見つかりません'
        });
      }

    } catch (error) {
      console.error('画像削除エラー:', error);
      return res.status(500).json({
        success: false,
        message: '画像の削除に失敗しました'
      });
    }
  };

  /**
   * 画像情報の取得
   */
  getImageInfo = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'ファイル名が指定されていません'
        });
      }

      // 各ディレクトリから画像ファイルを検索
      const directories = [
        'uploads/products',
        'uploads/categories'
      ];

      for (const dir of directories) {
        const imagePath = path.join(process.cwd(), dir, filename);
        
        try {
          const metadata = await imageService.getImageInfo(imagePath);
          const stats = require('fs').statSync(imagePath);

          return res.status(200).json({
            success: true,
            imageInfo: {
              filename,
              path: `/${dir}/${filename}`,
              size: stats.size,
              width: metadata.width,
              height: metadata.height,
              format: metadata.format,
              created: stats.birthtime,
              modified: stats.mtime
            }
          });

        } catch (error) {
          // このディレクトリにはファイルが存在しない、次のディレクトリを確認
          continue;
        }
      }

      return res.status(404).json({
        success: false,
        message: '指定された画像ファイルが見つかりません'
      });

    } catch (error) {
      console.error('画像情報取得エラー:', error);
      return res.status(500).json({
        success: false,
        message: '画像情報の取得に失敗しました'
      });
    }
  };

  /**
   * 一時ファイルのクリーンアップ
   */
  cleanupTempFiles = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const deletedCount = await imageService.cleanupTempFiles();

      return res.status(200).json({
        success: true,
        message: `${deletedCount}個の一時ファイルが削除されました`,
        deletedCount
      });

    } catch (error) {
      console.error('一時ファイルクリーンアップエラー:', error);
      return res.status(500).json({
        success: false,
        message: '一時ファイルのクリーンアップに失敗しました'
      });
    }
  };
} 