'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/api/apiClient';

interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ categories: Category[] }>('/categories');
        setCategories(response.categories);
        setError(null);
      } catch (err: any) {
        setError(err.message || '商品カテゴリの取得に失敗しました');
        console.error('カテゴリ取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">商品カテゴリ</h1>
      
      {loading && <p className="text-center py-4">読み込み中...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && categories.length === 0 && (
        <p className="text-center py-4">カテゴリがありません</p>
      )}
      
      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/categories/${category.slug}`}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="h-40 bg-gray-200 relative">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">画像なし</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600 text-sm">{category.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 