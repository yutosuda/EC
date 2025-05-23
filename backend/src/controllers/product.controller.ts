import { Request, Response } from 'express';
import { Product, IProduct } from '../models/product.model';
import mongoose from 'mongoose';

export class ProductController {
  // 商品一覧を取得
  getAllProducts = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      
      // 表示可能な商品のみを取得
      const products = await Product.find({ isVisible: true })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // 総商品数を取得
      const totalProducts = await Product.countDocuments({ isVisible: true });
      
      res.status(200).json({
        products,
        pagination: {
          total: totalProducts,
          page,
          limit,
          pages: Math.ceil(totalProducts / limit),
        },
      });
    } catch (error) {
      console.error('商品一覧取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // 商品詳細を取得
  getProductById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: '無効な商品IDです' });
      }
      
      const product = await Product.findById(id).populate('category', 'name slug');
      
      if (!product) {
        return res.status(404).json({ message: '商品が見つかりません' });
      }
      
      // 非表示商品は管理者以外には表示しない
      if (!product.isVisible && (!req.user || req.user.role !== 'admin')) {
        return res.status(404).json({ message: '商品が見つかりません' });
      }
      
      res.status(200).json({ product });
    } catch (error) {
      console.error('商品詳細取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // 商品をカテゴリで検索
  getProductsByCategory = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { categoryId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: '無効なカテゴリIDです' });
      }
      
      // 指定カテゴリの表示可能な商品のみを取得
      const products = await Product.find({ category: categoryId, isVisible: true })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // 総商品数を取得
      const totalProducts = await Product.countDocuments({ category: categoryId, isVisible: true });
      
      res.status(200).json({
        products,
        pagination: {
          total: totalProducts,
          page,
          limit,
          pages: Math.ceil(totalProducts / limit),
        },
      });
    } catch (error) {
      console.error('カテゴリ別商品取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // 商品を検索
  searchProducts = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { query } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      
      // テキスト検索クエリを作成
      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } },
          { manufacturer: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } },
        ],
        isVisible: true,
      };
      
      // 検索結果を取得
      const products = await Product.find(searchQuery)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // 総結果数を取得
      const totalProducts = await Product.countDocuments(searchQuery);
      
      res.status(200).json({
        products,
        pagination: {
          total: totalProducts,
          page,
          limit,
          pages: Math.ceil(totalProducts / limit),
        },
      });
    } catch (error) {
      console.error('商品検索エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // 商品を新規作成（管理者のみ）
  createProduct = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const {
        name,
        description,
        price,
        comparePrice,
        sku,
        images,
        mainImage,
        category,
        manufacturer,
        brand,
        specifications,
        stock,
        isUsed,
        condition,
        isVisible,
        tags,
      } = req.body;
      
      // 必須フィールドの検証
      if (!name || !description || !price || !sku || !category || !manufacturer) {
        return res.status(400).json({
          message: '商品名、説明、価格、SKU、カテゴリ、メーカーは必須です',
        });
      }
      
      // SKUの重複チェック
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({ message: 'このSKUは既に使用されています' });
      }
      
      // 新規商品の作成
      const newProduct = new Product({
        name,
        description,
        price,
        comparePrice,
        sku,
        images: images || [],
        mainImage,
        category,
        manufacturer,
        brand,
        specifications: specifications || {},
        stock: stock || 0,
        isUsed: isUsed || false,
        condition,
        isVisible: isVisible !== undefined ? isVisible : true,
        tags: tags || [],
      });
      
      await newProduct.save();
      
      res.status(201).json({
        message: '商品が作成されました',
        product: newProduct,
      });
    } catch (error) {
      console.error('商品作成エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // 商品を更新（管理者のみ）
  updateProduct = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        price,
        comparePrice,
        sku,
        images,
        mainImage,
        category,
        manufacturer,
        brand,
        specifications,
        stock,
        isUsed,
        condition,
        isVisible,
        tags,
      } = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: '無効な商品IDです' });
      }
      
      // 必須フィールドの検証
      if (!name || !description || !price || !sku || !category || !manufacturer) {
        return res.status(400).json({
          message: '商品名、説明、価格、SKU、カテゴリ、メーカーは必須です',
        });
      }
      
      // SKUの重複チェック（自分自身を除く）
      const existingProduct = await Product.findOne({ sku, _id: { $ne: id } });
      if (existingProduct) {
        return res.status(400).json({ message: 'このSKUは既に使用されています' });
      }
      
      // 商品を更新
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          name,
          description,
          price,
          comparePrice,
          sku,
          images,
          mainImage,
          category,
          manufacturer,
          brand,
          specifications,
          stock,
          isUsed,
          condition,
          isVisible,
          tags,
        },
        { new: true }
      );
      
      if (!updatedProduct) {
        return res.status(404).json({ message: '商品が見つかりません' });
      }
      
      res.status(200).json({
        message: '商品が更新されました',
        product: updatedProduct,
      });
    } catch (error) {
      console.error('商品更新エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // 商品を削除（管理者のみ）
  deleteProduct = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: '無効な商品IDです' });
      }
      
      // 商品を削除
      const deletedProduct = await Product.findByIdAndDelete(id);
      
      if (!deletedProduct) {
        return res.status(404).json({ message: '商品が見つかりません' });
      }
      
      res.status(200).json({
        message: '商品が削除されました',
      });
    } catch (error) {
      console.error('商品削除エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };
} 