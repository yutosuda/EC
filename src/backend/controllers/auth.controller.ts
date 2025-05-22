import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { APIError, ErrorCode, createAuthError, createConflictError, createNotFoundError } from '../utils/error.util';

export class AuthController {
  // ユーザー登録
  register = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // メールアドレスが既に使用されているか確認
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createConflictError('メールアドレス', email);
    }

    // 新規ユーザーの作成
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      addresses: [],
    });

    await newUser.save();

    // パスワードを除外してユーザー情報を返す
    const userWithoutPassword = { ...newUser.toObject() };
    delete userWithoutPassword.password;

    // JWTトークンの生成
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'ユーザー登録が完了しました',
      user: userWithoutPassword,
      token,
    });
  };

  // ログイン
  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // ユーザー検索
    const user = await User.findOne({ email });
    if (!user) {
      throw createAuthError('メールアドレスまたはパスワードが正しくありません');
    }

    // パスワード検証
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createAuthError('メールアドレスまたはパスワードが正しくありません');
    }

    // パスワードを除外してユーザー情報を返す
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    // JWTトークンの生成
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'ログインに成功しました',
      user: userWithoutPassword,
      token,
    });
  };

  // 現在のユーザー情報を取得
  getCurrentUser = async (req: Request, res: Response) => {
    // req.userはauthMiddlewareでセットされている
    const user = req.user;
    
    // パスワードを除外
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    return res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  };

  // パスワード変更
  changePassword = async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // ユーザー検索
    const user = await User.findById(userId);
    if (!user) {
      throw createNotFoundError('ユーザー');
    }

    // 現在のパスワード検証
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw createAuthError('現在のパスワードが正しくありません');
    }

    // 新しいパスワードを設定
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'パスワードが変更されました'
    });
  };

  // パスワードリセットリクエスト（メール送信）
  resetPasswordRequest = async (req: Request, res: Response) => {
    const { email } = req.body;

    // ユーザー検索
    const user = await User.findOne({ email });
    if (!user) {
      // セキュリティのため、ユーザーが存在しなくても同じレスポンスを返す
      return res.status(200).json({
        success: true,
        message: 'パスワードリセット用のメールを送信しました'
      });
    }

    // 実際のアプリケーションでは、ここでパスワードリセットトークンを生成し、
    // メール送信処理を実装します。

    return res.status(200).json({
      success: true,
      message: 'パスワードリセット用のメールを送信しました'
    });
  };

  // パスワードリセット
  resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    // 実際のアプリケーションでは、ここでトークンを検証し、
    // ユーザーのパスワードを更新する処理を実装します。

    return res.status(200).json({
      success: true,
      message: 'パスワードがリセットされました'
    });
  };
} 