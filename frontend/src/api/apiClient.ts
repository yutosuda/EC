/**
 * APIクライアント
 * バックエンドAPIとの通信を処理する
 */

// 環境変数からAPIのベースURLを取得
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// APIリクエストのレスポンス型
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  [key: string]: any;
}

/**
 * APIクライアントクラス
 */
class ApiClient {
  private token: string | null = null;

  /**
   * JWTトークンを設定
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * JWTトークンをクリア
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * リクエストヘッダーを生成
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * APIリクエストを実行
   */
  private async request<T>(
    endpoint: string,
    method: string,
    body?: any
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        // エラーレスポンスの場合
        const error: any = new Error(data.message || 'APIリクエストに失敗しました');
        error.status = response.status;
        error.response = data;
        throw error;
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('APIリクエストに失敗しました');
    }
  }

  /**
   * GET リクエスト
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET');
  }

  /**
   * POST リクエスト
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, 'POST', data);
  }

  /**
   * PUT リクエスト
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, 'PUT', data);
  }

  /**
   * DELETE リクエスト
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'DELETE');
  }
}

// APIクライアントのシングルトンインスタンス
export const apiClient = new ApiClient(); 