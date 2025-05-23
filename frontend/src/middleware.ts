import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 保護されたルート（認証が必要なルート）
const protectedRoutes = [
  '/account',
  '/account/orders',
  '/checkout',
];

// 認証済みユーザーがアクセスできないルート
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function middleware(request: NextRequest) {
  // トークンの存在を確認
  const token = request.cookies.get('construction-ec-auth')?.value;
  const hasToken = !!token;
  
  const path = request.nextUrl.pathname;
  
  // 保護されたルートへのアクセスで、トークンがない場合はログインページへリダイレクト
  if (protectedRoutes.some(route => path.startsWith(route)) && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 既に認証済みで、認証関連ページにアクセスしようとしている場合はマイページへリダイレクト
  if (authRoutes.some(route => path.startsWith(route)) && hasToken) {
    return NextResponse.redirect(new URL('/account', request.url));
  }
  
  return NextResponse.next();
}

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
}; 