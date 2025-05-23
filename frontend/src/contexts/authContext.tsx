import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore, User } from './authStore';

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// デフォルト値でコンテキストを作成
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
});

// コンテキストを使用するためのカスタムフック
export const useAuth = () => useContext(AuthContext);

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Zustandストアからステートとアクションを取得
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    getCurrentUser,
  } = useAuthStore();

  // コンポーネントマウント時に認証状態を確認
  useEffect(() => {
    // ユーザーが認証されていない場合のみトークンをチェック
    if (!isAuthenticated) {
      getCurrentUser();
    }
  }, [isAuthenticated, getCurrentUser]);

  // コンテキスト値
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 