/**
 * Jestのテスト環境セットアップ
 * 各テスト実行の前後に行うセットアップ/クリーンアップ処理
 */
import { setupBeforeEach, teardownAfterEach } from './setup';

// 各テスト実行前の処理
beforeEach(async () => {
  await setupBeforeEach();
});

// 各テスト実行後の処理
afterEach(async () => {
  await teardownAfterEach();
});

// タイムアウトの設定
jest.setTimeout(30000);

// グローバルなモックやフラグ設定
process.env.TEST_MODE = 'true'; 