import axiosInstance from "@/config/axios";
import type { Category, ApiResponse, PageResponse } from "../types/categoryTypes";

export const categoryService = {
  async getAll(page = 0, size = 10) {
    const res = await axiosInstance.get<ApiResponse<PageResponse<Category>>>(
      `/api/categories?page=${page}&size=${size}`
    );

    return res.data.data;
  },

  async getTree() {
    const res = await axiosInstance.get<ApiResponse<Category[]>>(
      `/api/categories/tree`
    );
    return res.data.data;
  },
};