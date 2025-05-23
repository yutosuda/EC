import { Request, Response } from 'express';
import { Category, ICategory } from '../models/category.model';

export class CategoryController {
  // カテゴリ一覧を取得
  getAllCategories = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const categories = await Category.find({ isActive: true }).sort({ order: 1 });
      res.status(200).json({ categories });
    } catch (error) {
      console.error('カテゴリ一覧取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // カテゴリ詳細を取得
  getCategoryById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      
      if (!category) {
        return res.status(404).json({ message: 'カテゴリが見つかりません' });
      }
      
      res.status(200).json({ category });
    } catch (error) {
      console.error('カテゴリ詳細取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // カテゴリを新規作成（管理者のみ）
  createCategory = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { name, description, slug, parent, image, isActive, order } = req.body;
      
      // 必須フィールドの検証
      if (!name || !slug) {
        return res.status(400).json({ message: 'カテゴリ名とスラッグは必須です' });
      }
      
      // スラッグの重複チェック
      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        return res.status(400).json({ message: 'このスラッグは既に使用されています' });
      }
      
      // 新規カテゴリの作成
      const newCategory = new Category({
        name,
        description,
        slug,
        parent,
        image,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      });
      
      await newCategory.save();
      
      res.status(201).json({
        message: 'カテゴリが作成されました',
        category: newCategory,
      });
    } catch (error) {
      console.error('カテゴリ作成エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // カテゴリを更新（管理者のみ）
  updateCategory = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const { name, description, slug, parent, image, isActive, order } = req.body;
      
      // 必須フィールドの検証
      if (!name || !slug) {
        return res.status(400).json({ message: 'カテゴリ名とスラッグは必須です' });
      }
      
      // スラッグの重複チェック（自分自身を除く）
      const existingCategory = await Category.findOne({ slug, _id: { $ne: id } });
      if (existingCategory) {
        return res.status(400).json({ message: 'このスラッグは既に使用されています' });
      }
      
      // カテゴリを更新
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        {
          name,
          description,
          slug,
          parent,
          image,
          isActive,
          order,
        },
        { new: true }
      );
      
      if (!updatedCategory) {
        return res.status(404).json({ message: 'カテゴリが見つかりません' });
      }
      
      res.status(200).json({
        message: 'カテゴリが更新されました',
        category: updatedCategory,
      });
    } catch (error) {
      console.error('カテゴリ更新エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // カテゴリを削除（管理者のみ）
  deleteCategory = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id } = req.params;
      
      // カテゴリを削除
      const deletedCategory = await Category.findByIdAndDelete(id);
      
      if (!deletedCategory) {
        return res.status(404).json({ message: 'カテゴリが見つかりません' });
      }
      
      res.status(200).json({
        message: 'カテゴリが削除されました',
      });
    } catch (error) {
      console.error('カテゴリ削除エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };
} 