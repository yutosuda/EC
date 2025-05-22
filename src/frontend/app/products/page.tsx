'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/frontend/api/apiClient';

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ products: Product[], pagination: Pagination }>(`/products?page=${currentPage}`);
        setProducts(response.products);
        setPagination(response.pagination);
        setError(null);
      } catch (err: any) {
        setError(err.message || '商品の取得に失敗しました');
        console.error('商品取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // 価格表示用のフォーマッタ
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">商品一覧</h1>
      
      {loading && <p className="text-center py-4">読み込み中...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && products.length === 0 && (
        <p className="text-center py-4">商品が見つかりません</p>
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
              <p className="text-gray-600 text-sm mb-2">
                カテゴリ: {product.category?.name || '未分類'}
              </p>
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