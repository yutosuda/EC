import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/apiClient';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'user' | 'admin' | 'business';
  accountType: 'individual' | 'business';
  companyName?: string;
  addresses: {
    addressType: 'shipping' | 'billing';
    postalCode: string;
    prefecture: string;
    city: string;
    address1: string;
    address2?: string;
    isDefault: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // アクション
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  getCurrentUser: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // ログイン
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
          
          if (response.success) {
            // APIクライアントにトークンを設定
            apiClient.setToken(response.token);
            
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'ログインに失敗しました'
          });
          throw error;
        }
      },
      
      // ユーザー登録
      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.post<AuthResponse>('/auth/register', userData);
          
          if (response.success) {
            // APIクライアントにトークンを設定
            apiClient.setToken(response.token);
            
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'ユーザー登録に失敗しました'
          });
          throw error;
        }
      },
      
      // ログアウト
      logout: () => {
        // APIクライアントのトークンをクリア
        apiClient.clearToken();
        
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },
      
      // エラーをクリア
      clearError: () => {
        set({ error: null });
      },
      
      // 現在のユーザー情報を取得
      getCurrentUser: async () => {
        const { token } = get();
        
        if (!token) {
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // APIクライアントにトークンを設定
          apiClient.setToken(token);
          
          const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
          
          if (response.success) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (error: any) {
          // トークンが無効な場合、ログアウト処理を行う
          if (error.status === 401) {
            get().logout();
          }
          
          set({
            isLoading: false,
            error: error.message || 'ユーザー情報の取得に失敗しました'
          });
        }
      },
      
      // ユーザー情報を更新
      updateUser: async (updatedUser: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.put<{ success: boolean; user: User }>('/user/profile', updatedUser);
          
          if (response.success) {
            set({
              user: response.user,
              isLoading: false
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'ユーザー情報の更新に失敗しました'
          });
          throw error;
        }
      },
      
      // パスワード変更
      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.put<{ success: boolean; message: string }>('/auth/change-password', {
            currentPassword,
            newPassword
          });
          
          set({ isLoading: false });
          
          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'パスワード変更に失敗しました'
          });
          throw error;
        }
      },
    }),
    {
      name: 'construction-ec-auth',
      // SSR対応: サーバーサイドでは永続化しない
      skipHydration: true,
    }
  )
); 