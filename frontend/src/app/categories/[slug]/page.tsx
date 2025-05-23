'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/api/apiClient';

interface Product {
  _id: string;
  name: string;
  price: number;
  comparePrice?: number;
  sku: string;
  mainImage?: string;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  stock: number;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // カテゴリ情報を取得
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (!params?.slug) return;
      
      try {
        setLoading(true);
        // slugでカテゴリを検索
        const response = await apiClient.get<{ category: Category }>(`/categories/slug/${params.slug}`);
        setCategory(response.category);
        
        // カテゴリIDが取得できたら、そのカテゴリに属する商品を取得
        if (response.category._id) {
          fetchCategoryProducts(response.category._id);
        }
      } catch (err: any) {
        setError(err.message || 'カテゴリ情報の取得に失敗しました');
        console.error('カテゴリ詳細取得エラー:', err);
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [params?.slug]);

  // カテゴリに属する商品を取得
  const fetchCategoryProducts = async (categoryId: string) => {
    try {
      const response = await apiClient.get<{ products: Product[], pagination: Pagination }>(
        `/products/category/${categoryId}?page=${currentPage}`
      );
      setProducts(response.products);
      setPagination(response.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'カテゴリ内の商品取得に失敗しました');
      console.error('カテゴリ商品取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // ページネーション処理
  useEffect(() => {
    if (category?._id) {
      fetchCategoryProducts(category._id);
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
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
            onClick={() => router.push('/categories')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            カテゴリ一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg">カテゴリが見つかりません</p>
          <button
            onClick={() => router.push('/categories')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            カテゴリ一覧に戻る
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
        <span onClick={() => router.push('/categories')} className="text-blue-600 hover:underline cursor-pointer">
          カテゴリ一覧
        </span>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-600">{category.name}</span>
      </div>

      {/* カテゴリヘッダー */}
      <div className="mb-8">
        {category.image && (
          <div className="h-40 mb-4 overflow-hidden rounded-lg">
            <img 
              src={category.image} 
              alt={category.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-700">{category.description}</p>
        )}
      </div>

      {/* 商品一覧 */}
      <h2 className="text-2xl font-semibold mb-6">商品一覧</h2>
      
      {products.length === 0 && (
        <p className="text-center py-4">このカテゴリには商品がありません</p>
      )}
      
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/products/${product._id}`}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="h-48 bg-gray-200 relative">
              {product.mainImage || product.images.length > 0 ? (
                <img
                  src={product.mainImage || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">画像なし</span>
                </div>
              )}
              {product.stock <= 0 && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs">
                  在庫切れ
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h2>
              <div className="flex items-end">
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-gray-500 line-through text-sm mr-2">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* ページネーション */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow-sm">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 border ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } ${page === 1 ? 'rounded-l-md' : ''} ${
                  page === pagination.pages ? 'rounded-r-md' : ''
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
} 