/**
 * フロントエンドとバックエンドの連携テストのためのセットアップファイル
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config({ path: '.env.test' });

// グローバル変数の型定義を拡張
declare global {
  var __MONGO_URI__: string;
  var __MONGO_DB_NAME__: string;
  var __MONGOD__: MongoMemoryServer;
}

/**
 * テスト環境のセットアップ
 * Jest の globalSetup で使用
 */
export default async (): Promise<void> => {
  // テスト用のインメモリMongoDBサーバーを起動
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // グローバル変数に保存（teardownで使用）
  global.__MONGOD__ = mongod;
  global.__MONGO_URI__ = uri;
  
  // 環境変数を設定
  process.env.MONGODB_URI = uri;
  process.env.TEST_MODE = 'true';
  
  // データベースに接続
  await mongoose.connect(uri);
  
  console.log('テスト用MongoDBサーバーが起動しました');
};

/**
 * テスト環境の後処理
 * Jest の globalTeardown で使用
 */
export async function teardown(): Promise<void> {
  // データベース接続を閉じる
  await mongoose.disconnect();
  
  // インメモリMongoDB停止
  const mongod = global.__MONGOD__;
  if (mongod) {
    await mongod.stop();
  }
  
  console.log('テスト用MongoDBサーバーを停止しました');
}

/**
 * 各テストの前に実行
 */
export const setupBeforeEach = async (): Promise<void> => {
  // 全コレクションをクリア
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * 各テストの後に実行
 */
export const teardownAfterEach = async (): Promise<void> => {
  // 必要に応じて追加のクリーンアップ処理
}; 