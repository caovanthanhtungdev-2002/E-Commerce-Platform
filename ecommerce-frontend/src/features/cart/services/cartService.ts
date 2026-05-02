import axiosInstance from "@/config/axios";
import type { ApiResponse, CartResponse } from "../types/cartTypes";

export const cartService = {
  async getCart() {
    const res = await axiosInstance.get<ApiResponse<CartResponse>>(
      "/api/cart"
    );
    return res.data.data;
  },

  async add(productId: number, quantity: number) {
    await axiosInstance.post<ApiResponse<void>>("/api/cart/add", {
      productId,
      quantity,
    });
  },

  async remove(productId: number) {
    await axiosInstance.delete<ApiResponse<void>>(
      `/api/cart/remove/${productId}`
    );
  },

  async clear() {
    await axiosInstance.delete<ApiResponse<void>>("/api/cart/clear");
  },
};