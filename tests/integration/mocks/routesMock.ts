/**
 * テスト用ルートモック
 * APIテスト時に本番コードの代わりに使用される
 */
import express from 'express';
import { PaymentControllerMock } from './controllerMocks';

/**
 * 決済ルーターのモック
 */
export const createMockPaymentRoutes = () => {
  const router = express.Router();

  // 決済意図（Payment Intent）の作成 - 認証不要(テスト用)
  router.post('/create-payment-intent', PaymentControllerMock.createPaymentIntent);

  // 決済ステータスの確認 - 認証不要(テスト用)
  router.get('/status/:orderId', PaymentControllerMock.checkPaymentStatus);

  // Webhookエンドポイント - 認証不要(テスト用)
  router.post('/webhook', express.json(), PaymentControllerMock.handleWebhook);

  return router;
};

/**
 * 商品ルーターのモック
 */
export const createMockProductRoutes = () => {
  const router = express.Router();

  // モックコントローラーの代わりに、ルート毎に直接ハンドラー関数を定義
  router.get('/', (req, res) => {
    // 商品検索処理のモック
    const items = [
      {
        id: 'product-123',
        name: 'テスト建設資材',
        price: 10000,
        category: 'category-123',
        sku: 'TEST-SKU-001',
        manufacturer: 'テストメーカー',
        stockCount: 100
      },
      {
        id: 'product-456',
        name: '別のテスト資材',
        price: 15000,
        category: 'category-123',
        sku: 'TEST-SKU-002',
        manufacturer: '高級メーカー',
        stockCount: 50
      },
      {
        id: 'product-789',
        name: '格安建設資材',
        price: 5000,
        category: 'category-456',
        sku: 'TEST-SKU-003',
        manufacturer: '格安メーカー',
        stockCount: 200
      }
    ];
    
    // クエリパラメータによる絞り込み処理
    let filteredItems = [...items];
    
    // キーワード検索
    if (req.query.keyword) {
      const keyword = String(req.query.keyword).toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(keyword)
      );
    }
    
    // カテゴリ絞り込み
    if (req.query.category) {
      const category = String(req.query.category);
      filteredItems = filteredItems.filter(item => 
        item.category === category
      );
    }
    
    // 価格範囲での絞り込み
    if (req.query.minPrice) {
      const minPrice = Number(req.query.minPrice);
      filteredItems = filteredItems.filter(item => item.price >= minPrice);
    }
    
    if (req.query.maxPrice) {
      const maxPrice = Number(req.query.maxPrice);
      filteredItems = filteredItems.filter(item => item.price <= maxPrice);
    }
    
    // SKUでの絞り込み
    if (req.query.sku) {
      const sku = String(req.query.sku);
      filteredItems = filteredItems.filter(item => item.sku === sku);
    }
    
    // メーカーでの絞り込み
    if (req.query.manufacturer) {
      const manufacturer = String(req.query.manufacturer);
      filteredItems = filteredItems.filter(item => 
        item.manufacturer === manufacturer
      );
    }
    
    // ソート処理
    if (req.query.sort) {
      const sortField = String(req.query.sort);
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      
      filteredItems.sort((a, b) => {
        // @ts-ignore
        if (a[sortField] === undefined || b[sortField] === undefined) {
          return 0;
        }
        // @ts-ignore
        return (a[sortField] > b[sortField] ? 1 : -1) * sortOrder;
      });
    }
    
    res.json({
      success: true,
      items: filteredItems,
      total: filteredItems.length
    });
  });

  router.post('/', (req, res) => {
    // 商品作成のモック
    const newProduct = {
      ...req.body,
      id: `product-${Date.now()}` // ユニークなIDを生成
    };
    
    res.status(201).json({
      success: true,
      id: newProduct.id,
      ...newProduct
    });
  });

  return router;
};

/**
 * カテゴリルーターのモック
 */
export const createMockCategoryRoutes = () => {
  const router = express.Router();

  router.get('/', (req, res) => {
    const categories = [
      {
        id: 'category-123',
        name: 'テストカテゴリ',
        slug: 'test-category'
      }
    ];
    
    res.json({
      success: true,
      items: categories,
      total: categories.length
    });
  });

  router.post('/', (req, res) => {
    // カテゴリ作成のモック
    const newCategory = {
      ...req.body,
      id: `category-${Date.now()}` // ユニークなIDを生成
    };
    
    res.status(201).json({
      success: true,
      id: newCategory.id,
      ...newCategory
    });
  });

  return router;
};

/**
 * 認証ルーターのモック
 */
export const createMockAuthRoutes = () => {
  const router = express.Router();

  router.post('/register', (req, res) => {
    const userData = req.body;
    
    res.status(201).json({
      success: true,
      userId: `user-${Date.now()}`,
      email: userData.email
    });
  });

  router.post('/login', (req, res) => {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 'user-123',
        email: req.body.email,
        role: req.body.email.includes('admin') ? 'admin' : 'user'
      }
    });
  });

  return router;
}; 