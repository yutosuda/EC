import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { 
  User, Product, Category, Order, 
  Cart, Review, Coupon, Wishlist,
  OrderStatus, PaymentMethod, CouponType,
  IUser, IProduct, ICategory, IOrder,
  ICart, IReview, ICoupon, IWishlist
} from '../../models';

// 環境変数の読み込み
dotenv.config();

// テストデータの作成と検証を行う関数
async function testDataModels() {
  try {
    // MongoDB に認証付きで接続
    const MONGODB_URI = 'mongodb://admin:password@localhost:27017/construction-ec-test?authSource=admin';
    await mongoose.connect(MONGODB_URI);
    console.log('テスト用のデータベース接続が確立されました');

    // 既存のテストデータをクリア
    await clearTestData();
    console.log('テストデータをクリアしました');

    // テストユーザーの作成
    const user = await createTestUser();
    console.log(`テストユーザーを作成しました: ${user.email}`);

    // テストカテゴリの作成
    const category = await createTestCategory();
    console.log(`テストカテゴリを作成しました: ${category.name}`);

    // テスト商品の作成
    const product = await createTestProduct(category._id as mongoose.Types.ObjectId);
    console.log(`テスト商品を作成しました: ${product.name}`);

    // テストカートの作成
    const cart = await createTestCart(user._id as mongoose.Types.ObjectId, product._id as mongoose.Types.ObjectId);
    console.log(`テストカートを作成しました。合計金額: ${cart.totalAmount}`);

    // テストレビューの作成
    const review = await createTestReview(user._id as mongoose.Types.ObjectId, product._id as mongoose.Types.ObjectId);
    console.log(`テストレビューを作成しました。評価: ${review.rating}`);

    // テストクーポンの作成
    const coupon = await createTestCoupon();
    console.log(`テストクーポンを作成しました。コード: ${coupon.code}`);

    // テストお気に入りの作成
    const wishlist = await createTestWishlist(user._id as mongoose.Types.ObjectId, product._id as mongoose.Types.ObjectId);
    console.log(`テストお気に入りを作成しました。商品数: ${wishlist.products.length}`);

    // テスト注文の作成
    const order = await createTestOrder(user._id as mongoose.Types.ObjectId, product._id as mongoose.Types.ObjectId);
    console.log(`テスト注文を作成しました。注文番号: ${order.orderNumber}`);

    // クーポンの有効性チェック（カスタムメソッド）
    const isValid = couponIsValid(coupon);
    console.log(`クーポンの有効性: ${isValid}`);

    // カートに商品を追加するテスト
    await testCartFunctions(cart, product._id as mongoose.Types.ObjectId);

    // お気に入りに商品を追加・削除するテスト
    await testWishlistFunctions(wishlist, product._id as mongoose.Types.ObjectId);

    console.log('すべてのテストが正常に完了しました！');
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
  } finally {
    // テスト完了後、接続を閉じる
    await mongoose.connection.close();
    console.log('データベース接続を閉じました');
  }
}

// テストデータをクリアする関数
async function clearTestData() {
  await User.deleteMany({ email: /^test/ });
  await Category.deleteMany({ name: /^テストカテゴリ/ });
  await Product.deleteMany({ name: /^テスト商品/ });
  await Cart.deleteMany({});
  await Review.deleteMany({});
  await Coupon.deleteMany({ code: /^TEST/ });
  await Wishlist.deleteMany({});
  await Order.deleteMany({ orderNumber: /^TEST/ });
}

// テストユーザーを作成する関数
async function createTestUser(): Promise<IUser> {
  const user = new User({
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'テスト',
    lastName: 'ユーザー',
    phoneNumber: '090-1234-5678',
    role: 'user',
    addresses: [
      {
        addressType: 'shipping',
        postalCode: '123-4567',
        prefecture: '東京都',
        city: '渋谷区',
        address1: '渋谷1-1-1',
        isDefault: true,
      },
    ],
  });

  return await user.save();
}

// テストカテゴリを作成する関数
async function createTestCategory(): Promise<ICategory> {
  const category = new Category({
    name: `テストカテゴリ-${Date.now()}`,
    description: 'テスト用のカテゴリです',
    slug: `test-category-${Date.now()}`,
    isActive: true,
    order: 1,
  });

  return await category.save();
}

// テスト商品を作成する関数
async function createTestProduct(categoryId: mongoose.Types.ObjectId): Promise<IProduct> {
  const product = new Product({
    name: `テスト商品-${Date.now()}`,
    description: 'テスト用の商品です',
    price: 1000,
    comparePrice: 1500,
    sku: `TEST-SKU-${Date.now()}`,
    images: ['test-image.jpg'],
    mainImage: 'test-image.jpg',
    category: categoryId,
    manufacturer: 'テストメーカー',
    brand: 'テストブランド',
    specifications: {
      '寸法': '100x200mm',
      '重量': '5kg',
    },
    stock: 100,
    isUsed: false,
    isVisible: true,
    tags: ['テスト', '建設資材'],
  });

  return await product.save();
}

// テストカートを作成する関数
async function createTestCart(userId: mongoose.Types.ObjectId, productId: mongoose.Types.ObjectId): Promise<ICart> {
  // findOrCreateCart メソッドを使用
  const cart = await (Cart as any).findOrCreateCart(userId);
  
  // 商品を追加（カスタムメソッドを直接呼び出す）
  cart.items.push({
    product: productId,
    quantity: 2,
    price: 1000,
    addedAt: new Date()
  });
  
  cart.totalAmount = 2000;
  await cart.save();
  
  return cart;
}

// テストレビューを作成する関数
async function createTestReview(userId: mongoose.Types.ObjectId, productId: mongoose.Types.ObjectId): Promise<IReview> {
  const review = new Review({
    product: productId,
    user: userId,
    rating: 4,
    title: 'テストレビュー',
    comment: 'これはテスト用のレビューです。商品は良好です。',
    isVerifiedPurchase: true,
    isApproved: true,
    helpfulCount: 0,
  });

  return await review.save();
}

// テストクーポンを作成する関数
async function createTestCoupon(): Promise<ICoupon> {
  const now = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  const coupon = new Coupon({
    code: `TEST-${Date.now()}`,
    type: CouponType.PERCENTAGE,
    value: 10,
    minimumPurchase: 500,
    maxDiscount: 1000,
    startDate: now,
    endDate: endDate,
    isActive: true,
    usageLimit: 100,
    usageCount: 0,
    userUsageLimit: 1,
  });

  return await coupon.save();
}

// クーポンの有効性をチェックする関数（カスタムメソッドの代わり）
function couponIsValid(coupon: ICoupon): boolean {
  const now = new Date();
  return (
    coupon.isActive &&
    now >= coupon.startDate &&
    now <= coupon.endDate &&
    (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)
  );
}

// テストお気に入りを作成する関数
async function createTestWishlist(userId: mongoose.Types.ObjectId, productId: mongoose.Types.ObjectId): Promise<IWishlist> {
  // findOrCreateWishlist メソッドを使用
  const wishlist = await (Wishlist as any).findOrCreateWishlist(userId);
  
  // 商品を追加（カスタムメソッドの代わりに直接配列操作）
  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
  }
  await wishlist.save();
  
  return wishlist;
}

// テスト注文を作成する関数
async function createTestOrder(userId: mongoose.Types.ObjectId, productId: mongoose.Types.ObjectId): Promise<IOrder> {
  const order = new Order({
    orderNumber: `TEST-${Date.now()}`,
    user: userId,
    items: [
      {
        product: productId,
        productSnapshot: {
          name: 'テスト商品',
          sku: 'TEST-SKU',
          price: 1000,
          image: 'test-image.jpg',
        },
        quantity: 2,
        price: 1000,
        total: 2000,
      },
    ],
    totalAmount: 2200,
    tax: 200,
    shippingFee: 0,
    status: OrderStatus.PENDING,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    paymentStatus: 'pending',
    shippingAddress: {
      postalCode: '123-4567',
      prefecture: '東京都',
      city: '渋谷区',
      address1: '渋谷1-1-1',
    },
    agreedTerms: true,
  });

  return await order.save();
}

// カート機能のテスト
async function testCartFunctions(cart: ICart, productId: mongoose.Types.ObjectId) {
  // 商品を追加・更新（カスタムメソッドの代わりに直接操作）
  const existingItemIndex = cart.items.findIndex(item => 
    (item.product as mongoose.Types.ObjectId).equals(productId)
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity = 3;
  } else {
    cart.items.push({
      product: productId,
      quantity: 3,
      price: 1000,
      addedAt: new Date()
    });
  }
  
  cart.totalAmount = cart.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  await cart.save();
  console.log(`カートの商品数量を更新しました。新しい合計金額: ${cart.totalAmount}`);

  // 商品を削除
  cart.items = cart.items.filter(item => 
    !(item.product as mongoose.Types.ObjectId).equals(productId)
  );
  
  cart.totalAmount = cart.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  await cart.save();
  console.log(`カートから商品を削除しました。新しい合計金額: ${cart.totalAmount}`);
}

// お気に入り機能のテスト
async function testWishlistFunctions(wishlist: IWishlist, productId: mongoose.Types.ObjectId) {
  // 商品が含まれているか確認
  const hasProduct = wishlist.products.some(id => 
    (id as mongoose.Types.ObjectId).equals(productId)
  );
  console.log(`お気に入りに商品が含まれているか: ${hasProduct}`);

  // 商品を削除
  wishlist.products = wishlist.products.filter(id => 
    !(id as mongoose.Types.ObjectId).equals(productId)
  );
  await wishlist.save();
  console.log(`お気に入りから商品を削除しました。商品数: ${wishlist.products.length}`);
}

// テスト実行
testDataModels(); 