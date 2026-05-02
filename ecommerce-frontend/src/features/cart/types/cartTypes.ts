export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
   image?: string; 
  selected?: boolean; 
}

export interface CartResponse {
  items: CartItem[];
  totalPrice: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}