import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

// MongoDB接続URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/construction-ec';

// MongoDB接続オプション
const connectOptions: mongoose.ConnectOptions = {
  // Mongooseオプション
};

// データベース接続関数
export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, connectOptions);
    console.log('MongoDB接続成功');
    
    // 接続が確立された後のインデックス構築
    mongoose.connection.on('connected', () => {
      console.log('MongoDB接続が確立されました');
    });
    
    // 接続エラー時の処理
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB接続エラー:', err);
    });
    
    // 接続切断時の処理
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB接続が切断されました');
    });
    
    // プロセス終了時の切断処理
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB接続を終了します');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    process.exit(1);
  }
};

// MongoDB接続確認関数
export const checkDatabaseConnection = (): boolean => {
  return mongoose.connection.readyState === 1;
}; 