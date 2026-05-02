export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
  avgRating?: number;
  reviewCount?: number;
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