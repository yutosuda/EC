import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export interface OrderItem {
  product: string; // 商品ID
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Address {
  addressType: 'shipping' | 'billing';
  postalCode: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
  isDefault: boolean;
}

export interface Order {
  _id?: string;
  user: string; // ユーザーID
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'convenience_store' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderSummary {
  subtotal: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  
  // 注文一覧取得
  fetchOrders: () => Promise<void>;
  
  // 特定の注文取得
  fetchOrderById: (orderId: string) => Promise<void>;
  
  // 注文作成
  createOrder: (orderData: Omit<Order, '_id' | 'user' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  
  // 注文キャンセル
  cancelOrder: (orderId: string) => Promise<void>;
  
  // 注文計算（小計、税額、送料、合計）
  calculateOrderSummary: (items: OrderItem[]) => OrderSummary;
  
  // エラークリア
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  
  // 注文一覧取得
  fetchOrders: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.get<{ success: boolean; orders: Order[] }>('/orders');
      
      if (response.success) {
        set({
          orders: response.orders,
          isLoading: false
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '注文一覧の取得に失敗しました'
      });
    }
  },
  
  // 特定の注文取得
  fetchOrderById: async (orderId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.get<{ success: boolean; order: Order }>(`/orders/${orderId}`);
      
      if (response.success) {
        set({
          currentOrder: response.order,
          isLoading: false
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '注文詳細の取得に失敗しました'
      });
    }
  },
  
  // 注文作成
  createOrder: async (orderData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.post<{ success: boolean; order: Order }>('/orders', orderData);
      
      if (response.success) {
        set({
          currentOrder: response.order,
          orders: [...get().orders, response.order],
          isLoading: false
        });
        
        return response.order;
      }
      
      throw new Error('注文の作成に失敗しました');
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '注文の作成に失敗しました'
      });
      throw error;
    }
  },
  
  // 注文キャンセル
  cancelOrder: async (orderId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.put<{ success: boolean; order: Order }>(`/orders/${orderId}/cancel`, {});
      
      if (response.success) {
        // 注文一覧を更新
        const updatedOrders = get().orders.map(order => 
          order._id === orderId ? response.order : order
        );
        
        // 現在の注文が対象の注文だった場合、それも更新
        const currentOrder = get().currentOrder;
        if (currentOrder && currentOrder._id === orderId) {
          set({ currentOrder: response.order });
        }
        
        set({
          orders: updatedOrders,
          isLoading: false
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '注文のキャンセルに失敗しました'
      });
    }
  },
  
  // 注文計算（小計、税額、送料、合計）
  calculateOrderSummary: (items: OrderItem[]) => {
    // 小計計算
    const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
    
    // 税額計算（10%）
    const taxAmount = Math.floor(subtotal * 0.1);
    
    // 送料計算（一律1000円、10000円以上は無料）
    const shippingFee = subtotal >= 10000 ? 0 : 1000;
    
    // 合計金額
    const totalAmount = subtotal + taxAmount + shippingFee;
    
    return {
      subtotal,
      taxAmount,
      shippingFee,
      totalAmount
    };
  },
  
  // エラークリア
  clearError: () => {
    set({ error: null });
  }
})); 