export interface OrderItem {
  productId: number;
  productName: string;
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
  items: OrderItem[];
}