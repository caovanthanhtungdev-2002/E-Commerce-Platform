export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  parentId?: number;
  parentName?: string;
  children?: Category[];
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