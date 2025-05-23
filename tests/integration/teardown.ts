/**
 * Jest用のグローバルティアダウン
 * すべてのテスト実行後に一度だけ実行される
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// グローバル変数の型定義
declare global {
  var __MONGOD__: MongoMemoryServer;
}

/**
 * テスト環境の後処理
 */
export default async (): Promise<void> => {
  // データベース接続を閉じる
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // インメモリMongoDB停止
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
  
  console.log('テスト用MongoDBサーバーを停止しました');
}; 