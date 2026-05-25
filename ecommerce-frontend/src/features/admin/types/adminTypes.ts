// ========== COMMON ==========
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ========== DASHBOARD ==========
export interface DashboardSummary {
  revenue: number;
  orders: number;
  users: number;
  products: number;
}

// ========== PRODUCT ==========
export interface AdminProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: number;
  categoryName?: string;
  avgRating?: number;
  reviewCount?: number;
  stock?: number;
}

export interface AdminCreateProductRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: number;
  stock?: number;
}

export interface AdminUpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: number;
}

export interface AdminProductFilter {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}

// ========== CATEGORY ==========
export interface AdminCategory {
  id: number;
  name: string;
  description?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

// ========== ORDER ==========
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface AdminOrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface AdminOrder {
  id: number;
  username: string;
  receiverName: string;
  phone: string;
  address: string;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod?: string;
  createdAt: string;
  items: AdminOrderItem[];
}

// ========== USER ==========
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  role: string;
  enabled: boolean;
  createdAt?: string;
}

// ========== COUPON ==========
export interface AdminCoupon {
  id: number;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
}

export interface CreateCouponRequest {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt?: string;
}

export interface UpdateCouponRequest {
  discountType?: "PERCENT" | "FIXED";
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt?: string;
}

// ========== INVENTORY ==========
export interface AdminInventory {
   productId: number;
  productName?: string;
  imageUrl?: string;
  stock: number;
  reserved: number;
  sold: number;
}