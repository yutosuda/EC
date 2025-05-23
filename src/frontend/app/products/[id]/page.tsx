'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/frontend/api/apiClient';
import { useCartStore, CartItem } from '@/frontend/contexts/cartStore';

interface ProductDetail {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  images: string[];
  mainImage?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  manufacturer: string;
  brand?: string;
  specifications: {
    [key: string]: string;
  };
  stock: number;
  isUsed: boolean;
  condition?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState<boolean>(false);

  // カートストアから追加メソッドを取得
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const response = await apiClient.get<{ product: ProductDetail }>(`/products/${params.id}`);
        setProduct(response.product);
        // 最初の画像または最初のメイン画像を選択
        setSelectedImage(response.product.mainImage || (response.product.images.length > 0 ? response.product.images[0] : null));
      } catch (err: any) {
        setError(err.message || '商品の取得に失敗しました');
        console.error('商品詳細取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [params.id]);

  // 数量変更ハンドラ
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  // 画像選択ハンドラ
  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
  };

  // カートに追加
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      // カートに商品を追加
      const cartItem: CartItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.mainImage || (product.images.length > 0 ? product.images[0] : undefined),
        quantity: quantity,
        stock: product.stock,
        sku: product.sku
      };
      
      addItem(cartItem);
      
      // 成功メッセージを表示
      setAddToCartSuccess(true);
      setTimeout(() => setAddToCartSuccess(false), 3000);
      
    } catch (err: any) {
      setError('カートへの追加に失敗しました');
      console.error('カート追加エラー:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  // 価格表示用のフォーマッタ
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => router.push('/products')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            商品一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg">商品が見つかりません</p>
          <button
            onClick={() => router.push('/products')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            商品一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <div className="text-sm mb-6">
        <span onClick={() => router.push('/')} className="text-blue-600 hover:underline cursor-pointer">
          ホーム
        </span>
        <span className="mx-2">&gt;</span>
        <span onClick={() => router.push('/products')} className="text-blue-600 hover:underline cursor-pointer">
          商品一覧
        </span>
        <span className="mx-2">&gt;</span>
        <span onClick={() => router.push(`/categories/${product.category._id}`)} className="text-blue-600 hover:underline cursor-pointer">
          {product.category.name}
        </span>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-600">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 商品画像セクション */}
        <div>
          <div className="bg-white rounded-lg overflow-hidden mb-4 h-80 flex items-center justify-center border">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-gray-500">画像なし</div>
            )}
          </div>
          
          {/* サムネイル一覧 */}
          {product.images.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`border rounded-md overflow-hidden h-20 cursor-pointer ${
                    selectedImage === image ? 'border-blue-500 ring-2 ring-blue-300' : ''
                  }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} - ${index + 1}`} 
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 商品情報セクション */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          {product.isUsed && (
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm inline-block mb-2">
              中古品
            </div>
          )}
          
          <div className="text-lg mb-4">
            <span className="text-gray-600 mr-2">メーカー:</span>
            <span className="font-medium">{product.manufacturer}</span>
            {product.brand && (
              <>
                <span className="text-gray-600 mx-2">ブランド:</span>
                <span className="font-medium">{product.brand}</span>
              </>
            )}
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            <span>商品コード: </span>
            <span className="font-mono">{product.sku}</span>
          </div>
          
          <div className="mb-6">
            {product.comparePrice && product.comparePrice > product.price && (
              <div className="line-through text-gray-500 text-lg">
                {formatPrice(product.comparePrice)}
              </div>
            )}
            <div className="text-3xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              (税込) 送料は別途
            </div>
          </div>
          
          {/* 在庫と購入セクション */}
          <div className="mb-6">
            <div className="mb-2">
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">在庫あり</span>
              ) : (
                <span className="text-red-600 font-medium">在庫切れ</span>
              )}
            </div>
            
            <div className="flex items-end space-x-4 mb-4">
              <div>
                <label htmlFor="quantity" className="block text-sm text-gray-600 mb-1">
                  数量
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={product.stock <= 0}
                  className="border rounded-md px-3 py-2 w-20"
                >
                  {[...Array(Math.min(10, product.stock || 0))].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || addingToCart}
                className={`px-6 py-3 rounded-md text-white font-medium flex-grow
                  ${product.stock > 0 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                  }`}
              >
                {addingToCart ? '追加中...' : 'カートに追加'}
              </button>
            </div>
            
            {addToCartSuccess && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md">
                商品をカートに追加しました。
              </div>
            )}
          </div>
          
          {/* 商品説明 */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">商品説明</h2>
            <div className="text-gray-700 whitespace-pre-line">
              {product.description}
            </div>
          </div>
          
          {/* 中古品の場合、状態説明を表示 */}
          {product.isUsed && product.condition && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">商品の状態</h2>
              <div className="text-gray-700">
                {product.condition}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 商品スペック */}
      {Object.keys(product.specifications).length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">商品スペック</h2>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap bg-gray-50 w-1/3 font-medium">
                      {key}
                    </td>
                    <td className="px-6 py-4 whitespace-pre-line">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 