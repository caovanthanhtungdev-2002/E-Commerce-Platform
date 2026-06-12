export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  categoryName?: string;
  avgRating?: number;
  reviewCount?: number;
  colors?: { label: string; hex: string }[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}