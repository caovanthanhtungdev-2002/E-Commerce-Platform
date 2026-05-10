import axiosInstance from "@/config/axios";
import type {
  ApiResponse,
  PageResponse,
  AdminCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/adminTypes";

export const adminCategoryService = {
  async getAll(page = 0, size = 20) {
    const res = await axiosInstance.get<ApiResponse<PageResponse<AdminCategory>>>(
      `/api/admin/categories?page=${page}&size=${size}`
    );
    return res.data.data;
  },

  async create(data: CreateCategoryRequest) {
    const res = await axiosInstance.post<ApiResponse<AdminCategory>>(
      `/api/admin/categories`,
      data
    );
    return res.data.data;
  },

  async update(id: number, data: UpdateCategoryRequest) {
    const res = await axiosInstance.put<ApiResponse<AdminCategory>>(
      `/api/admin/categories/${id}`,
      data
    );
    return res.data.data;
  },

  async delete(id: number) {
    await axiosInstance.delete(`/api/admin/categories/${id}`);
  },
};