export interface ReviewResponse {
  id: number;
  username: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  imageUrl?: string;
  createdAt: string;
}

export interface ReviewSummaryResponse {
  avgRating: number | null;
  totalReviews: number;
  starCounts: Record<number, number>;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}