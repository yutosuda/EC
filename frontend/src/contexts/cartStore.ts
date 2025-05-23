import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  stock: number;
  sku: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      // 商品をカートに追加
      addItem: (item: CartItem) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(i => i.productId === item.productId);
        
        if (existingItemIndex !== -1) {
          // 既存のアイテムの数量を更新
          const updatedItems = [...items];
          const currentQuantity = updatedItems[existingItemIndex].quantity;
          const newQuantity = Math.min(currentQuantity + item.quantity, item.stock);
          
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQuantity,
          };
          
          set({ items: updatedItems });
        } else {
          // 新しいアイテムを追加
          set({ items: [...items, item] });
        }
      },
      
      // 商品をカートから削除
      removeItem: (productId: string) => {
        const { items } = get();
        set({ items: items.filter(item => item.productId !== productId) });
      },
      
      // 商品の数量を更新
      updateQuantity: (productId: string, quantity: number) => {
        const { items } = get();
        const updatedItems = items.map(item => 
          item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) }
            : item
        );
        
        set({ items: updatedItems });
      },
      
      // カートをクリア
      clearCart: () => {
        set({ items: [] });
      },
      
      // カート内の総アイテム数を取得
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      // カート内の合計金額を取得
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'construction-ec-cart',
      // SSR対応: サーバーサイドでは永続化しない
      skipHydration: true,
    }
  )
); 