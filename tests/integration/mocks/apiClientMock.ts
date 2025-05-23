/**
 * フロントエンドのAPIクライアントのモック
 * フロントエンドとバックエンドの連携テスト時に使用
 */
import supertest from 'supertest';
import { Express } from 'express';

/**
 * APIクライアントモッククラス
 * src/frontend/api/apiClient.ts と同じインターフェースを持ちますが、
 * 内部では supertest を使用してバックエンドと直接通信します
 */
export class ApiClientMock {
  private app: Express;
  private token: string | null = null;
  private debug: boolean = false;
  private useApiPrefix: boolean = true; // デフォルトで/apiプレフィックスを使用

  constructor(app: Express, debug: boolean = false) {
    this.app = app;
    this.debug = debug;
    console.log('APIクライアントモックを初期化しました');
  }

  /**
   * 認証トークンを設定
   */
  setToken(token: string): void {
    this.token = token;
    if (this.debug) console.log('トークンを設定しました:', token.substring(0, 10) + '...');
  }

  /**
   * 認証トークンをクリア
   */
  clearToken(): void {
    this.token = null;
    if (this.debug) console.log('トークンをクリアしました');
  }

  /**
   * デバッグモードの切り替え
   */
  setDebug(enable: boolean): void {
    this.debug = enable;
  }

  /**
   * APIプレフィックスの使用設定
   * @param use trueの場合、/apiプレフィックスを使用。falseの場合、使用しない
   */
  setUseApiPrefix(use: boolean): void {
    this.useApiPrefix = use;
    if (this.debug) console.log(`APIプレフィックスの使用: ${use ? '有効' : '無効'}`);
  }

  /**
   * リクエストヘッダーを生成
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * API URLを構築
   * useApiPrefixの設定に基づいてURLを生成
   */
  private buildApiUrl(endpoint: string, query?: string): string {
    const prefix = this.useApiPrefix ? '/api' : '';
    return `${prefix}${endpoint}${query ? `?${query}` : ''}`;
  }

  /**
   * GETリクエスト
   * @param url エンドポイントURL
   * @param params クエリパラメータ
   * @returns レスポンスデータ
   */
  async get<T = any>(url: string, params: Record<string, string> = {}): Promise<T> {
    // クエリパラメータの構築
    const query = new URLSearchParams();
    for (const key in params) {
      query.append(key, params[key]);
    }

    // API URLの構築
    const apiUrl = this.buildApiUrl(url, query.toString());
    
    if (this.debug) console.log(`GET リクエスト: ${apiUrl}`);
    
    try {
      // リクエスト送信
      const request = supertest(this.app);
      const response = await request
        .get(apiUrl)
        .set(this.getHeaders());

      // ステータスコードが2xxでなければエラーをスロー
      if (response.status < 200 || response.status >= 300) {
        if (this.debug) console.error(`応答エラー (${response.status}):`, response.text);
        
        // /apiプレフィックスがエラーの原因かもしれない場合、フォールバックを試みる
        if (response.status === 404 && this.useApiPrefix) {
          if (this.debug) console.log('フォールバック: プレフィックスなしで再試行します');
          
          // 一時的にAPIプレフィックスを無効化
          this.useApiPrefix = false;
          try {
            // リクエストを再試行
            const result = await this.get<T>(url, params);
            return result;
          } finally {
            // 元の設定に戻す
            this.useApiPrefix = true;
          }
        }
        
        throw new Error(`APIエラー: ${response.status} ${response.text}`);
      }

      if (this.debug) console.log(`正常応答 (${response.status})`);
      return response.body;
    } catch (error) {
      if (this.debug) console.error(`リクエスト失敗: ${apiUrl}`, error);
      throw error;
    }
  }

  /**
   * POSTリクエスト
   * @param url エンドポイントURL
   * @param data リクエストボディ
   * @returns レスポンスデータ
   */
  async post<T = any>(url: string, data: any = {}): Promise<T> {
    // API URLの構築
    const apiUrl = this.buildApiUrl(url);
    
    if (this.debug) console.log(`POST リクエスト: ${apiUrl}`, data);
    
    try {
      // リクエスト送信
      const request = supertest(this.app);
      const response = await request
        .post(apiUrl)
        .set(this.getHeaders())
        .send(data);

      // ステータスコードが2xxでなければエラーをスロー
      if (response.status < 200 || response.status >= 300) {
        if (this.debug) console.error(`応答エラー (${response.status}):`, response.text);
        
        // /apiプレフィックスがエラーの原因かもしれない場合、フォールバックを試みる
        if (response.status === 404 && this.useApiPrefix) {
          if (this.debug) console.log('フォールバック: プレフィックスなしで再試行します');
          
          // 一時的にAPIプレフィックスを無効化
          this.useApiPrefix = false;
          try {
            // リクエストを再試行
            const result = await this.post<T>(url, data);
            return result;
          } finally {
            // 元の設定に戻す
            this.useApiPrefix = true;
          }
        }
        
        throw new Error(`APIエラー: ${response.status} ${response.text}`);
      }

      if (this.debug) console.log(`正常応答 (${response.status})`);
      return response.body;
    } catch (error) {
      if (this.debug) console.error(`リクエスト失敗: ${apiUrl}`, error);
      throw error;
    }
  }

  /**
   * PUTリクエスト
   * @param url エンドポイントURL
   * @param data リクエストボディ
   * @returns レスポンスデータ
   */
  async put<T = any>(url: string, data: any = {}): Promise<T> {
    // API URLの構築
    const apiUrl = this.buildApiUrl(url);
    
    if (this.debug) console.log(`PUT リクエスト: ${apiUrl}`, data);
    
    try {
      // リクエスト送信
      const request = supertest(this.app);
      const response = await request
        .put(apiUrl)
        .set(this.getHeaders())
        .send(data);

      // ステータスコードが2xxでなければエラーをスロー
      if (response.status < 200 || response.status >= 300) {
        if (this.debug) console.error(`応答エラー (${response.status}):`, response.text);
        
        // /apiプレフィックスがエラーの原因かもしれない場合、フォールバックを試みる
        if (response.status === 404 && this.useApiPrefix) {
          if (this.debug) console.log('フォールバック: プレフィックスなしで再試行します');
          
          // 一時的にAPIプレフィックスを無効化
          this.useApiPrefix = false;
          try {
            // リクエストを再試行
            const result = await this.put<T>(url, data);
            return result;
          } finally {
            // 元の設定に戻す
            this.useApiPrefix = true;
          }
        }
        
        throw new Error(`APIエラー: ${response.status} ${response.text}`);
      }

      if (this.debug) console.log(`正常応答 (${response.status})`);
      return response.body;
    } catch (error) {
      if (this.debug) console.error(`リクエスト失敗: ${apiUrl}`, error);
      throw error;
    }
  }

  /**
   * DELETEリクエスト
   * @param url エンドポイントURL
   * @returns レスポンスデータ
   */
  async delete<T = any>(url: string): Promise<T> {
    // API URLの構築
    const apiUrl = this.buildApiUrl(url);
    
    if (this.debug) console.log(`DELETE リクエスト: ${apiUrl}`);
    
    try {
      // リクエスト送信
      const request = supertest(this.app);
      const response = await request
        .delete(apiUrl)
        .set(this.getHeaders());

      // ステータスコードが2xxでなければエラーをスロー
      if (response.status < 200 || response.status >= 300) {
        if (this.debug) console.error(`応答エラー (${response.status}):`, response.text);
        
        // /apiプレフィックスがエラーの原因かもしれない場合、フォールバックを試みる
        if (response.status === 404 && this.useApiPrefix) {
          if (this.debug) console.log('フォールバック: プレフィックスなしで再試行します');
          
          // 一時的にAPIプレフィックスを無効化
          this.useApiPrefix = false;
          try {
            // リクエストを再試行
            const result = await this.delete<T>(url);
            return result;
          } finally {
            // 元の設定に戻す
            this.useApiPrefix = true;
          }
        }
        
        throw new Error(`APIエラー: ${response.status} ${response.text}`);
      }

      if (this.debug) console.log(`正常応答 (${response.status})`);
      return response.body;
    } catch (error) {
      if (this.debug) console.error(`リクエスト失敗: ${apiUrl}`, error);
      throw error;
    }
  }
}

/**
 * ExpressアプリケーションインスタンスからモックAPIクライアントを作成
 */
export const createApiClientMock = (app: Express, debug: boolean = false): ApiClientMock => {
  return new ApiClientMock(app, debug);
}; 