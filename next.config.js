/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // ビルド出力ディレクトリを明示的に指定
  distDir: '.next',
  // APIのURLをフロントエンドから環境変数として利用可能にする
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
  },
  // ソースディレクトリの設定（Nextjs 15では新しい構成オプション）
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig; 