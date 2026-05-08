export interface OrderItem {
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  totalPrice: number;
  finalPrice: number;
  discount: number;
  couponCode?: string;
  status: string;
  paymentMethod: string;
  items: OrderItem[];

  // SHIPPING — khớp với OrderResponse.java
  receiverName: string;
  phone: string;
  address: string;
}

// ========================================
// REQUEST DTO — khớp với CreateOrderRequest.java
// ========================================

export interface CreateOrderRequest {
  couponCode?: string;
  paymentMethod?: string;
  receiverName: string;
  phone: string;
  address: string;
}