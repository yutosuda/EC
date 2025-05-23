/**
 * テスト用のシードデータ作成ユーティリティ
 * テスト前に必要なデータを自動的に作成する
 */
import mongoose from 'mongoose';
import { ApiClientMock } from '../mocks/apiClientMock';
import { 
  createTestAdminUser, 
  createTestUser, 
  createTestBusinessUser,
  createTestCategory,
  createTestProduct 
} from './testUtils';

/**
 * テスト用のシードデータを作成する
 * @param apiClient APIクライアントモック
 */
export const seedTestData = async (apiClient: ApiClientMock): Promise<{
  adminId: string;
  adminToken: string;
  userId: string;
  userToken: string;
  businessUserId: string;
  businessToken: string;
  categoryId: string;
  productId: string;
}> => {
  try {
    // 管理者ユーザーの作成と認証
    const adminData = createTestAdminUser();
    const adminRegistration = await apiClient.post<{ userId: string }>('/auth/register', adminData);
    const adminId = adminRegistration.userId;
    
    // MongoDB接続がある場合、直接roleを変更（実装に依存）
    if (mongoose.connection.readyState === 1) {
      try {
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(adminId, { role: 'admin' });
      } catch (error) {
        console.warn('管理者権限の設定に失敗しました。APIの実装を確認してください。');
      }
    }
    
    // 管理者ログイン
    const adminLogin = await apiClient.post<{ token: string }>('/auth/login', {
      email: adminData.email,
      password: adminData.password
    });
    const adminToken = adminLogin.token;
    apiClient.setToken(adminToken);
    
    // カテゴリの作成
    const categoryData = createTestCategory();
    const category = await apiClient.post<{ id: string }>('/categories', categoryData);
    const categoryId = category.id;
    
    // 商品の作成
    const productData = createTestProduct();
    productData.category = categoryId;
    const product = await apiClient.post<{ id: string }>('/products', productData);
    const productId = product.id;
    
    // 一般ユーザーの作成
    apiClient.clearToken(); // 管理者トークンをクリア
    const userData = createTestUser();
    const userRegistration = await apiClient.post<{ userId: string }>('/auth/register', userData);
    const userId = userRegistration.userId;
    
    // 一般ユーザーログイン
    const userLogin = await apiClient.post<{ token: string }>('/auth/login', {
      email: userData.email,
      password: userData.password
    });
    const userToken = userLogin.token;
    
    // 法人ユーザーの作成
    const businessUserData = createTestBusinessUser();
    const businessRegistration = await apiClient.post<{ userId: string }>('/auth/register', businessUserData);
    const businessUserId = businessRegistration.userId;
    
    // 法人ユーザーログイン
    const businessLogin = await apiClient.post<{ token: string }>('/auth/login', {
      email: businessUserData.email,
      password: businessUserData.password
    });
    const businessToken = businessLogin.token;
    
    // トークンをクリア（テスト側で必要に応じて設定する）
    apiClient.clearToken();
    
    return {
      adminId,
      adminToken,
      userId,
      userToken,
      businessUserId,
      businessToken,
      categoryId,
      productId
    };
  } catch (error) {
    console.error('シードデータ作成中にエラー:', error);
    throw error;
  }
}; 