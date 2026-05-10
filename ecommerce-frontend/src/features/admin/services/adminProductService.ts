import axiosInstance from "@/config/axios";
import type {
  ApiResponse,
  PageResponse,
  AdminProduct,
  AdminCreateProductRequest,
  AdminUpdateProductRequest,
  AdminProductFilter,
} from "../types/adminTypes";

export const adminProductService = {
  async getAll(filter: AdminProductFilter = {}, page = 0, size = 20) {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", String(size));
    if (filter.keyword) params.append("keyword", filter.keyword);
    if (filter.categoryId) params.append("categoryId", String(filter.categoryId));
    if (filter.minPrice != null) params.append("minPrice", String(filter.minPrice));
    if (filter.maxPrice != null) params.append("maxPrice", String(filter.maxPrice));

    const res = await axiosInstance.get<ApiResponse<PageResponse<AdminProduct>>>(
      `/api/admin/products?${params}`
    );
    return res.data.data;
  },

  async getById(id: number) {
    const res = await axiosInstance.get<ApiResponse<AdminProduct>>(
      `/api/admin/products/${id}`
    );
    return res.data.data;
  },

  async create(data: AdminCreateProductRequest) {
    const res = await axiosInstance.post<ApiResponse<AdminProduct>>(
      `/api/admin/products`,
      data
    );
    return res.data.data;
  },

  async update(id: number, data: AdminUpdateProductRequest) {
    const res = await axiosInstance.put<ApiResponse<AdminProduct>>(
      `/api/admin/products/${id}`,
      data
    );
    return res.data.data;
  },

  async delete(id: number) {
    await axiosInstance.delete(`/api/admin/products/${id}`);
  },
};