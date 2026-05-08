import axiosInstance from "@/config/axios";
import type { Product, ApiResponse, PageResponse } from "../types/productTypes";

export const productService = {

  async getAll(
  page = 0,
  size = 20,
  categoryId?: number
) {
  let url = `/api/products?page=${page}&size=${size}`;

  if (categoryId) {
    url += `&categoryId=${categoryId}`;
  }

  const res =
    await axiosInstance.get<
      ApiResponse<PageResponse<Product>>
    >(url);

  return res.data.data;
},

  async getById(id: number) {
    const res = await axiosInstance.get<ApiResponse<Product>>(
      `/api/products/${id}`
    );

    return res.data.data;
  },

  async search(
  body: {
    keyword?: string;
    minPrice?: number;
    maxPrice?: number;
    categoryId?: number;
  },
  page = 0,
  size = 20
) {
  const res = await axiosInstance.post<ApiResponse<PageResponse<Product>>>(
    `/api/products/search?page=${page}&size=${size}`,
    body
  );

  return res.data.data;
},
};