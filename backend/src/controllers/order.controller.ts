import { Request, Response } from 'express';
import { Order, OrderStatus, PaymentMethod, IOrder } from '../models/order.model';
import { Product } from '../models/product.model';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { emailService } from '../services/email.service';

export class OrderController {
  // 注文を作成（認証済みユーザーのみ）
  createOrder = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const {
        items,
        shippingAddress,
        paymentMethod,
        notes,
        agreedTerms,
        agreedSpecialConditions,
      } = req.body;
      
      // ユーザーIDを取得（authMiddlewareでセット済み）
      const userId = req.user._id;
      
      // 必須フィールドの検証
      if (!items || !items.length || !shippingAddress || !paymentMethod) {
        return res.status(400).json({
          message: '注文商品、配送先住所、支払い方法は必須です',
        });
      }
      
      // 利用規約同意の検証
      if (!agreedTerms) {
        return res.status(400).json({
          message: '利用規約への同意が必要です',
        });
      }
      
             // 中古品など特別条件のある商品が含まれているか確認
       const productIds = items.map((item: any) => item.product);
       const products = await Product.find({ _id: { $in: productIds } });
       
       const hasUsedProducts = products.some((product) => product.isUsed);
       
       // 中古品が含まれている場合、特別条件への同意が必要
       if (hasUsedProducts && !agreedSpecialConditions) {
         return res.status(400).json({
           message: '中古品の購入には特別条件への同意が必要です',
         });
       }
       
       // 商品の存在と在庫数を確認
       for (const item of items) {
         const product = products.find((p) => String(p._id) === item.product);
         
         if (!product) {
           return res.status(404).json({
             message: `商品ID ${item.product} が見つかりません`,
           });
         }
         
         if (product.stock < item.quantity) {
           return res.status(400).json({
             message: `商品 ${product.name} の在庫が不足しています。在庫数: ${product.stock}`,
           });
         }
       }
       
       // 注文アイテムの詳細情報（金額計算のため）を設定
       const orderItems = items.map((item: any) => {
         const product = products.find((p) => String(p._id) === item.product);
         return {
           product: item.product,
           productSnapshot: {
             name: product?.name,
             sku: product?.sku,
             price: product?.price,
             image: product?.mainImage || (product?.images && product.images.length > 0 ? product.images[0] : undefined),
           },
           quantity: item.quantity,
           price: product?.price || 0,
           total: (product?.price || 0) * item.quantity,
         };
       });
       
       // 合計金額計算
       const subtotal = orderItems.reduce((sum: number, item: any) => sum + item.total, 0);
      
      // 消費税計算（10%と仮定）
      const taxRate = 0.1;
      const tax = Math.round(subtotal * taxRate);
      
      // 送料計算（例：10,000円以上は送料無料、それ以下は一律800円）
      const shippingFee = subtotal >= 10000 ? 0 : 800;
      
      // 総合計
      const totalAmount = subtotal + tax + shippingFee;
      
      // 注文番号生成（Order.generateOrderNumberはstaticメソッドなので別途実装必要）
      const orderNumber = await Order.generateOrderNumber();
      
      // 注文データ作成
      const newOrder = new Order({
        orderNumber,
        user: userId,
        items: orderItems,
        totalAmount,
        tax,
        shippingFee,
        status: OrderStatus.PENDING,
        paymentMethod,
        paymentStatus: 'pending',
        shippingAddress,
        notes,
        agreedTerms,
        agreedSpecialConditions: agreedSpecialConditions || false,
      });
      
      // 注文保存
      await newOrder.save();
      
      // 在庫数更新
      for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
      
      // ユーザー情報を取得（メール送信用）
      const user = await User.findById(userId);
      
      // 注文受付メールを送信（非同期で実行）
      if (user) {
        const orderWithUserData = {
          ...newOrder.toObject(),
          user: user.toObject()
        };
        
        emailService.sendOrderConfirmationEmail(
          user.email,
          `${user.lastName} ${user.firstName}`,
          orderWithUserData
        ).catch(error => {
          console.error('注文受付メール送信エラー:', error);
        });

        // 管理者への新規注文通知メール
        emailService.sendNewOrderNotificationEmail(orderWithUserData)
          .catch(error => {
            console.error('管理者通知メール送信エラー:', error);
          });
      }
      
      res.status(201).json({
        message: '注文が作成されました',
        order: newOrder,
      });
    } catch (error) {
      console.error('注文作成エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // 自分の注文履歴を取得（認証済みユーザーのみ）
  getMyOrders = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      
      // ユーザーの注文履歴を取得
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // 総注文数を取得
      const totalOrders = await Order.countDocuments({ user: userId });
      
      res.status(200).json({
        orders,
        pagination: {
          total: totalOrders,
          page,
          limit,
          pages: Math.ceil(totalOrders / limit),
        },
      });
    } catch (error) {
      console.error('注文履歴取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // 注文詳細を取得（認証済みユーザーのみ - 自分の注文のみ）
  getOrderById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: '無効な注文IDです' });
      }
      
      // 注文詳細を取得
      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({ message: '注文が見つかりません' });
      }
      
      // 自分の注文かアクセス権限（管理者）があるか確認
      if (order.user.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'この注文にアクセスする権限がありません' });
      }
      
      res.status(200).json({ order });
    } catch (error) {
      console.error('注文詳細取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // 全注文一覧を取得（管理者のみ）
  getAllOrders = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      
      // ステータスでフィルタリング（オプション）
      const status = req.query.status as string;
      const filterQuery = status ? { status } : {};
      
      // 注文一覧を取得
      const orders = await Order.find(filterQuery)
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // 総注文数を取得
      const totalOrders = await Order.countDocuments(filterQuery);
      
      res.status(200).json({
        orders,
        pagination: {
          total: totalOrders,
          page,
          limit,
          pages: Math.ceil(totalOrders / limit),
        },
      });
    } catch (error) {
      console.error('全注文一覧取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };

  // 注文ステータスを更新（管理者のみ）
  updateOrderStatus = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const { status, trackingNumber, shippingCompany } = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: '無効な注文IDです' });
      }
      
      if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
        return res.status(400).json({ message: '有効な注文ステータスを指定してください' });
      }
      
      // 更新データを準備
      const updateData: any = { status };
      
      // 配送情報が提供されている場合は更新
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (shippingCompany) updateData.shippingCompany = shippingCompany;
      
      // ステータスに応じた日時を設定
      if (status === OrderStatus.SHIPPED) {
        updateData.shippedAt = new Date();
      } else if (status === OrderStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      }
      
      // 注文を更新
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('user', 'firstName lastName email');
      
      if (!updatedOrder) {
        return res.status(404).json({ message: '注文が見つかりません' });
      }
      
      // 発送完了時にメール通知を送信
      if (status === OrderStatus.SHIPPED && updatedOrder.user) {
        const user = updatedOrder.user as any;
        emailService.sendShippingNotificationEmail(
          user.email,
          `${user.lastName} ${user.firstName}`,
          updatedOrder.toObject()
        ).catch(error => {
          console.error('発送完了メール送信エラー:', error);
        });
      }
      
      res.status(200).json({
        message: '注文ステータスが更新されました',
        order: updatedOrder,
      });
    } catch (error) {
      console.error('注文ステータス更新エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  };
} 