'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/api/apiClient';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  stock: number;
  category: string;
  manufacturer: string;
  brand?: string;
  specifications: Record<string, string>;
  isAvailable: boolean;
  isUsed: boolean;
  condition?: string;
  // 画像関連フィールドは後で追加
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const isNewProduct = params?.id === 'new';
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    sku: '',
    stock: 0,
    category: '',
    manufacturer: '',
    specifications: {},
    isAvailable: true,
    isUsed: false
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [specs, setSpecs] = useState<{key: string, value: string}[]>([{ key: '', value: '' }]);

  // カテゴリ取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<{ categories: Category[] }>('/categories');
        setCategories(response.categories);
      } catch (err) {
        console.error('カテゴリ取得エラー:', err);
      }
    };

    fetchCategories();
  }, []);

  // 商品データ取得（編集時）
  useEffect(() => {
    const fetchProductData = async () => {
      if (isNewProduct) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get<{ product: any }>(`/products/${params?.id}`);
        const product = response.product;
        
        // フォームデータにセット
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          sku: product.sku,
          stock: product.stock,
          category: product.category?._id || '',
          manufacturer: product.manufacturer,
          brand: product.brand,
          specifications: product.specifications || {},
          isAvailable: product.isAvailable !== false,
          isUsed: product.isUsed || false,
          condition: product.condition
        });

        // 仕様情報をフォーム用に変換
        if (product.specifications && Object.keys(product.specifications).length > 0) {
          const specsArray = Object.entries(product.specifications).map(
            ([key, value]) => ({ key, value: value as string })
          );
          setSpecs(specsArray);
        }
      } catch (err: any) {
        setError('商品情報の取得に失敗しました');
        console.error('商品取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [params?.id, isNewProduct]);

  // 入力フィールド変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 仕様フィールド変更ハンドラ
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
    
    // formDataのspecificationsも更新
    const newSpecifications: Record<string, string> = {};
    newSpecs.forEach(spec => {
      if (spec.key && spec.value) {
        newSpecifications[spec.key] = spec.value;
      }
    });
    setFormData(prev => ({ ...prev, specifications: newSpecifications }));
  };

  // 仕様フィールド追加
  const addSpecField = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  // 仕様フィールド削除
  const removeSpecField = (index: number) => {
    if (specs.length > 1) {
      const newSpecs = specs.filter((_, i) => i !== index);
      setSpecs(newSpecs);
      
      // formDataのspecificationsも更新
      const newSpecifications: Record<string, string> = {};
      newSpecs.forEach(spec => {
        if (spec.key && spec.value) {
          newSpecifications[spec.key] = spec.value;
        }
      });
      setFormData(prev => ({ ...prev, specifications: newSpecifications }));
    }
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      if (isNewProduct) {
        // 新規作成
        await apiClient.post('/products', formData);
        setSuccess('商品が正常に作成されました');
        router.push('/admin/products');
      } else {
        // 更新
        await apiClient.put(`/products/${params?.id}`, formData);
        setSuccess('商品が正常に更新されました');
      }
    } catch (err: any) {
      setError(err.message || '商品の保存に失敗しました');
      console.error('商品保存エラー:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isNewProduct ? '新規商品登録' : '商品編集'}</h1>
        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          戻る
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本情報 */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU (商品コード) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">カテゴリを選択</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メーカー <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ブランド
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand || ''}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                販売価格 (税込) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                  className="w-full border rounded px-3 py-2 pl-7"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                参考価格 (税込)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  name="comparePrice"
                  value={formData.comparePrice || ''}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full border rounded px-3 py-2 pl-7"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                オプション。割引前の価格やメーカー希望小売価格など。
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                在庫数 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                step="1"
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                商品を公開する
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isUsed"
                name="isUsed"
                checked={formData.isUsed}
                onChange={(e) => setFormData(prev => ({ ...prev, isUsed: e.target.checked }))}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="isUsed" className="text-sm font-medium text-gray-700">
                中古品
              </label>
            </div>

            {formData.isUsed && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  コンディション
                </label>
                <textarea
                  name="condition"
                  value={formData.condition || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                  placeholder="中古品の状態説明（傷の有無、使用期間など）"
                ></textarea>
              </div>
            )}
          </div>

          {/* 商品説明 */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-2">商品説明</h2>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full border rounded px-3 py-2"
              placeholder="商品の詳細な説明を入力してください"
            ></textarea>
          </div>

          {/* 仕様情報 */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">仕様情報</h2>
              <button
                type="button"
                onClick={addSpecField}
                className="text-blue-600 hover:text-blue-800"
              >
                + 項目を追加
              </button>
            </div>
            
            {specs.map((spec, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  placeholder="項目名（例: サイズ）"
                  className="w-1/3 border rounded px-3 py-2"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  placeholder="値（例: 10cm x 20cm）"
                  className="w-1/2 border rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => removeSpecField(index)}
                  className="text-red-600 hover:text-red-800"
                  title="削除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* 画像アップロード（今後実装） */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-2">画像アップロード</h2>
            <p className="text-gray-500 mb-4">※ 画像アップロード機能は現在開発中です</p>
          </div>
          
          {/* 送信ボタン */}
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={saving}
              className={`bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? '保存中...' : (isNewProduct ? '商品を登録する' : '変更を保存する')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 