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
  // Thông tin giao hàng
  receiverName: string;
  phone: string;
  address: string;
}