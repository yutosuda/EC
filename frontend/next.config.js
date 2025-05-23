/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  images: {
    domains: ['localhost'],
  },
  
  // APIのURLをフロントエンドから環境変数として利用可能にする
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
  },
  
  // 実験的機能 - typedRoutesを一時的に無効化（開発段階のため）
  experimental: {
    // typedRoutes: true, // 全ページ実装後に再有効化予定
  },
};

module.exports = nextConfig; 