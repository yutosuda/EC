import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models';

export class CartController {
  // カートを取得
  getCart = async (req: Request, res: Response) => {
    try {
      const userId = req.user._id;

      // ユーザーのカートを取得または作成
      const cart = await (Cart as any).findOrCreateCart(userId);

      // 商品情報をポピュレート
      await cart.populate('items.product');

      res.status(200).json({
        success: true,
        cart,
      });
    } catch (error) {
      console.error('カート取得エラー:', error);
      res.status(500).json({
        success: false,
        message: 'カートの取得中にエラーが発生しました',
      });
    }
  };

  // 商品をカートに追加
  addToCart = async (req: Request, res: Response) => {
    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;

      // バリデーション
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: '商品IDと有効な数量が必要です',
        });
      }

      // ユーザーのカートを取得または作成
      const cart = await (Cart as any).findOrCreateCart(userId);

      // 商品をカートに追加
      const productObjectId = new mongoose.Types.ObjectId(productId);
      
      // 商品の価格を取得（実際の実装では商品モデルから最新の価格を取得すべき）
      const { Product } = require('../models');
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: '商品が見つかりません',
        });
      }

      // 在庫チェック
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: '在庫が不足しています',
        });
      }

      // カートに商品を追加または更新
      const existingItemIndex = cart.items.findIndex(item => 
        item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // 既存のアイテムを更新
        cart.items[existingItemIndex].quantity = quantity;
        cart.items[existingItemIndex].price = product.price;
        cart.items[existingItemIndex].addedAt = new Date();
      } else {
        // 新しいアイテムを追加
        cart.items.push({
          product: productObjectId,
          quantity,
          price: product.price,
          addedAt: new Date(),
        });
      }

      // 合計金額を再計算
      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      await cart.save();

      // 商品情報をポピュレート
      await cart.populate('items.product');

      res.status(200).json({
        success: true,
        message: '商品がカートに追加されました',
        cart,
      });
    } catch (error) {
      console.error('カート追加エラー:', error);
      res.status(500).json({
        success: false,
        message: 'カートへの追加中にエラーが発生しました',
      });
    }
  };

  // カートから商品を削除
  removeFromCart = async (req: Request, res: Response) => {
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

      // ユーザーのカートを取得
      const cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'カートが見つかりません',
        });
      }

      // 商品をカートから削除
      const productObjectId = new mongoose.Types.ObjectId(productId);
      cart.items = cart.items.filter(item => 
        !item.product.equals(productObjectId)
      );

      // 合計金額を再計算
      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      await cart.save();

      res.status(200).json({
        success: true,
        message: '商品がカートから削除されました',
        cart,
      });
    } catch (error) {
      console.error('カート削除エラー:', error);
      res.status(500).json({
        success: false,
        message: 'カートからの削除中にエラーが発生しました',
      });
    }
  };

  // カートを空にする
  clearCart = async (req: Request, res: Response) => {
    try {
      const userId = req.user._id;

      // ユーザーのカートを取得
      const cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'カートが見つかりません',
        });
      }

      // カートを空にする
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();

      res.status(200).json({
        success: true,
        message: 'カートが空になりました',
        cart,
      });
    } catch (error) {
      console.error('カートクリアエラー:', error);
      res.status(500).json({
        success: false,
        message: 'カートのクリア中にエラーが発生しました',
      });
    }
  };

  // カート内の商品数量を更新
  updateCartItemQuantity = async (req: Request, res: Response) => {
    try {
      const userId = req.user._id;
      const { productId } = req.params;
      const { quantity } = req.body;

      // バリデーション
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: '商品IDと有効な数量が必要です',
        });
      }

      // ユーザーのカートを取得
      const cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'カートが見つかりません',
        });
      }

      // 商品の在庫を確認
      const { Product } = require('../models');
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: '商品が見つかりません',
        });
      }

      // 在庫チェック
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: '在庫が不足しています',
        });
      }

      // 商品数量を更新
      const productObjectId = new mongoose.Types.ObjectId(productId);
      const itemIndex = cart.items.findIndex(item => 
        item.product.equals(productObjectId)
      );

      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'カート内にこの商品が見つかりません',
        });
      }

      cart.items[itemIndex].quantity = quantity;

      // 合計金額を再計算
      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      await cart.save();

      // 商品情報をポピュレート
      await cart.populate('items.product');

      res.status(200).json({
        success: true,
        message: 'カート内の商品数量が更新されました',
        cart,
      });
    } catch (error) {
      console.error('カート更新エラー:', error);
      res.status(500).json({
        success: false,
        message: 'カートの更新中にエラーが発生しました',
      });
    }
  };
} 