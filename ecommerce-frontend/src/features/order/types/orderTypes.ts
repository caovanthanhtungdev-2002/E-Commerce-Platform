export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "RETURNED"
  | "COMPLETED";
export interface OrderStatusHistory {
  status: OrderStatus;
  changedAt: string;   
  note?: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export interface BuyNowItem {
  productId: number;
  quantity: number;
}

export interface Order {
  id: number;
  username: string;        
  totalPrice: number;
  finalPrice: number;
  discount: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: string;
  items: OrderItem[];
  receiverName: string;
  phone: string;
  address: string;
  createdAt?: string;  
  updatedAt?: string;
  statusHistory?: OrderStatusHistory[];      
  paidAt?: string;          
}

export interface CreateOrderRequest {
  couponCode?: string;
  paymentMethod?: string;
  receiverName: string;
  phone: string;
  address: string;
  selectedProductIds: number[];
  buyNowItems?: BuyNowItem[];
}