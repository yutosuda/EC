import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Wishlist, Product } from '../models';

export class WishlistController {
  // お気に入りリストを取得
  getWishlist = async (req: Request, res: Response) => {
    try {
      const userId = req.user._id;

      // ユーザーのお気に入りを取得または作成
      const wishlist = await (Wishlist as any).findOrCreateWishlist(userId);

      // 商品情報をポピュレート
      await wishlist.populate('products');

      res.status(200).json({
        success: true,
        wishlist,
      });
    } catch (error) {
      console.error('お気に入り取得エラー:', error);
      res.status(500).json({
        success: false,
        message: 'お気に入りの取得中にエラーが発生しました',
      });
    }
  };

  // 商品をお気に入りに追加
  addToWishlist = async (req: Request, res: Response) => {
    try {
      const userId = req.user._id;
      const { productId } = req.body;

      // バリデーション
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: '商品IDが必要です',
        });
      }

      // 商品が存在するか確認
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: '商品が見つかりません',
        });
      }

      // ユーザーのお気に入りを取得または作成
      const wishlist = await (Wishlist as any).findOrCreateWishlist(userId);

      // 商品をお気に入りに追加
      const productObjectId = new mongoose.Types.ObjectId(productId);
      
      // 既に追加されていないか確認
      const isProductInWishlist = wishlist.products.some((p: mongoose.Types.ObjectId) => 
        p.equals(productObjectId)
      );

      if (!isProductInWishlist) {
        wishlist.products.push(productObjectId);
        await wishlist.save();
      }

      // 商品情報をポピュレート
      await wishlist.populate('products');

      res.status(200).json({
        success: true,
        message: '商品がお気に入りに追加されました',
        wishlist,
      });
    } catch (error) {
      console.error('お気に入り追加エラー:', error);
      res.status(500).json({
        success: false,
        message: 'お気に入りへの追加中にエラーが発生しました',
      });
    }
  };

  // お気に入りから商品を削除
  removeFromWishlist = async (req: Request, res: Response) => {
    try {
      const userId = req.user._id;
      const { productId } = req.params;

      // バリデーション
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: '商品IDが必要です',
        });
      }

      // ユーザーのお気に入りを取得
      const wishlist = await Wishlist.findOne({ user: userId });

      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message: 'お気に入りリストが見つかりません',
        });
      }

      // 商品をお気に入りから削除
      const productObjectId = new mongoose.Types.ObjectId(productId);
      wishlist.products = wishlist.products.filter((p: mongoose.Types.ObjectId) => 
        !p.equals(productObjectId)
      );

      await wishlist.save();

      // 商品情報をポピュレート
      await wishlist.populate('products');

      res.status(200).json({
        success: true,
        message: '商品がお気に入りから削除されました',
        wishlist,
      });
    } catch (error) {
      console.error('お気に入り削除エラー:', error);
      res.status(500).json({
        success: false,
        message: 'お気に入りからの削除中にエラーが発生しました',
      });
    }
  };

  // お気に入りをすべて削除
  clearWishlist = async (req: Request, res: Response) => {
    try {
      const userId = req.user._id;

      // ユーザーのお気に入りを取得
      const wishlist = await Wishlist.findOne({ user: userId });

      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message: 'お気に入りリストが見つかりません',
        });
      }

      // お気に入りを空にする
      wishlist.products = [];
      await wishlist.save();

      res.status(200).json({
        success: true,
        message: 'お気に入りリストが空になりました',
        wishlist,
      });
    } catch (error) {
      console.error('お気に入りクリアエラー:', error);
      res.status(500).json({
        success: false,
        message: 'お気に入りのクリア中にエラーが発生しました',
      });
    }
  };

  // 商品がお気に入りに入っているか確認
  checkProductInWishlist = async (req: Request, res: Response) => {
    try {
      const userId = req.user._id;
      const { productId } = req.params;

      // バリデーション
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: '商品IDが必要です',
        });
      }

      // ユーザーのお気に入りを取得
      const wishlist = await Wishlist.findOne({ user: userId });

      if (!wishlist) {
        return res.status(200).json({
          success: true,
          isInWishlist: false,
        });
      }

      // 商品がお気に入りに含まれているか確認
      const productObjectId = new mongoose.Types.ObjectId(productId);
      const isInWishlist = wishlist.products.some((p: mongoose.Types.ObjectId) => 
        p.equals(productObjectId)
      );

      res.status(200).json({
        success: true,
        isInWishlist,
      });
    } catch (error) {
      console.error('お気に入り確認エラー:', error);
      res.status(500).json({
        success: false,
        message: 'お気に入りの確認中にエラーが発生しました',
      });
    }
  };
} 