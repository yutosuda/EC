/**
 * フロントエンドとバックエンドの連携テスト用のJest設定
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '\\.test\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // モックパス設定
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../src/$1'
  },
  // グローバルセットアップとティアダウン
  globalSetup: '<rootDir>/setup.ts',
  globalTeardown: '<rootDir>/teardown.ts',
  // テストのタイムアウト設定（統合テストは時間がかかる場合がある）
  testTimeout: 30000,
  // テスト実行前後のフック
  setupFilesAfterEnv: ['<rootDir>/setupEnv.ts'],
  // カバレッジ設定
  collectCoverageFrom: [
    '../../src/backend/**/*.ts',
    '../../src/frontend/api/**/*.ts',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageDirectory: '<rootDir>/../../coverage/integration',
  // テスト並列実行は無効化（統合テストではデータベースアクセスが発生するため）
  maxWorkers: 1,
  // 特別なフラグ
  testEnvironmentOptions: {
    // MongoDBメモリサーバー用の設定
    NODE_ENV: 'test',
    TEST_MODE: 'true'
  }
}; 