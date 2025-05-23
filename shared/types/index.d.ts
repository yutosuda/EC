export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'user' | 'admin' | 'business';
    accountType: 'individual' | 'business';
    companyName?: string;
    addresses: Address[];
    createdAt: Date;
    updatedAt: Date;
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
export interface Product {
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
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    parentCategory?: string;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    sku: string;
}
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export interface OrderItem {
    product: string;
    quantity: number;
    price: number;
    subtotal: number;
}
export interface Order {
    _id: string;
    orderNumber: string;
    user: string;
    items: OrderItem[];
    totalAmount: number;
    tax: number;
    shippingFee: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentIntentId?: string;
    shippingAddress: Address;
    trackingNumber?: string;
    shippingCompany?: string;
    notes?: string;
    agreedTerms: boolean;
    agreedSpecialConditions?: boolean;
    createdAt: Date;
    updatedAt: Date;
    paidAt?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    accountType: 'individual' | 'business';
    companyName?: string;
}
export interface AuthResponse {
    user: User;
    token: string;
}
export interface ValidationError {
    field: string;
    message: string;
}
//# sourceMappingURL=index.d.ts.map