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
  receiverName: string;
  phone: string;
  address: string;
}

export interface CreateOrderRequest {
  couponCode?: string;
  paymentMethod?: string;
  receiverName: string;
  phone: string;
  address: string;
  selectedProductIds: number[];
}