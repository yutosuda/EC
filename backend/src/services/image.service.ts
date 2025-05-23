import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

interface ImageResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface ProcessedImageInfo {
  originalPath: string;
  processedPath: string;
  filename: string;
  size: number;
  width: number;
  height: number;
  format: string;
}

export class ImageService {
  private readonly uploadDir: string;
  private readonly processedDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.processedDir = path.join(process.cwd(), 'uploads', 'processed');
    this.ensureDirectories();
  }

  /**
   * 必要なディレクトリを作成
   */
  private ensureDirectories(): void {
    const directories = [
      this.uploadDir,
      this.processedDir,
      path.join(this.uploadDir, 'products'),
      path.join(this.uploadDir, 'categories'),
      path.join(this.processedDir, 'products'),
      path.join(this.processedDir, 'categories'),
      path.join(this.processedDir, 'thumbnails'),
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 画像をリサイズ・最適化する
   */
  async processImage(
    inputPath: string,
    outputPath: string,
    options: ImageResizeOptions = {}
  ): Promise<ProcessedImageInfo> {
    const {
      width = 800,
      height,
      quality = 85,
      format = 'jpeg'
    } = options;

    try {
      let sharpInstance = sharp(inputPath);

      // リサイズ処理
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // フォーマット・品質設定
      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
      }

      // 処理実行
      const info = await sharpInstance.toFile(outputPath);

      return {
        originalPath: inputPath,
        processedPath: outputPath,
        filename: path.basename(outputPath),
        size: info.size,
        width: info.width,
        height: info.height,
        format: info.format
      };

    } catch (error) {
      console.error('画像処理エラー:', error);
      throw new Error('画像の処理に失敗しました');
    }
  }

  /**
   * サムネイル画像を生成
   */
  async generateThumbnail(
    inputPath: string,
    outputPath: string,
    size: number = 200
  ): Promise<ProcessedImageInfo> {
    return this.processImage(inputPath, outputPath, {
      width: size,
      height: size,
      quality: 80,
      format: 'jpeg'
    });
  }

  /**
   * 複数サイズの画像を一括生成
   */
  async generateMultipleSizes(
    inputPath: string,
    baseName: string,
    type: 'product' | 'category'
  ): Promise<{ [key: string]: ProcessedImageInfo }> {
    const sizes = {
      large: { width: 800, height: 600 },
      medium: { width: 400, height: 300 },
      small: { width: 200, height: 150 },
      thumbnail: { width: 100, height: 100 }
    };

    const results: { [key: string]: ProcessedImageInfo } = {};

    for (const [sizeName, sizeOptions] of Object.entries(sizes)) {
      const outputPath = path.join(
        this.processedDir,
        type === 'product' ? 'products' : 'categories',
        `${baseName}_${sizeName}.jpg`
      );

      try {
        results[sizeName] = await this.processImage(inputPath, outputPath, {
          ...sizeOptions,
          format: 'jpeg',
          quality: 85
        });
      } catch (error) {
        console.error(`サイズ ${sizeName} の生成に失敗:`, error);
      }
    }

    return results;
  }

  /**
   * WebP形式で最適化
   */
  async optimizeForWeb(
    inputPath: string,
    outputPath: string,
    quality: number = 80
  ): Promise<ProcessedImageInfo> {
    return this.processImage(inputPath, outputPath, {
      format: 'webp',
      quality,
      width: 800
    });
  }

  /**
   * 画像ファイルを削除
   */
  async deleteImage(imagePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('画像削除エラー:', error);
      return false;
    }
  }

  /**
   * 画像ファイルの情報を取得
   */
  async getImageInfo(imagePath: string): Promise<sharp.Metadata> {
    try {
      return await sharp(imagePath).metadata();
    } catch (error) {
      console.error('画像情報取得エラー:', error);
      throw new Error('画像ファイルの情報を取得できませんでした');
    }
  }

  /**
   * 画像のバリデーション
   */
  async validateImage(imagePath: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const metadata = await this.getImageInfo(imagePath);
      
      // ファイルサイズチェック（10MB以下）
      const stats = fs.statSync(imagePath);
      if (stats.size > 10 * 1024 * 1024) {
        return { valid: false, error: 'ファイルサイズが大きすぎます（10MB以下にしてください）' };
      }

      // 画像形式チェック
      const allowedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
      if (!metadata.format || !allowedFormats.includes(metadata.format)) {
        return { valid: false, error: 'サポートされていない画像形式です' };
      }

      // 解像度チェック（最大4000x4000）
      if (metadata.width && metadata.height) {
        if (metadata.width > 4000 || metadata.height > 4000) {
          return { valid: false, error: '画像サイズが大きすぎます（4000x4000以下にしてください）' };
        }
      }

      return { valid: true };

    } catch (error) {
      return { valid: false, error: '画像ファイルが破損している可能性があります' };
    }
  }

  /**
   * 一時的なアップロードファイルをクリーンアップ
   */
  async cleanupTempFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<number> {
    let deletedCount = 0;
    const now = Date.now();

    const directories = [
      this.uploadDir,
      path.join(this.uploadDir, 'products'),
      path.join(this.uploadDir, 'categories')
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) continue;

      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          try {
            fs.unlinkSync(filePath);
            deletedCount++;
          } catch (error) {
            console.error(`ファイル削除エラー: ${filePath}`, error);
          }
        }
      }
    }

    return deletedCount;
  }
}

// シングルトンインスタンス
export const imageService = new ImageService(); 