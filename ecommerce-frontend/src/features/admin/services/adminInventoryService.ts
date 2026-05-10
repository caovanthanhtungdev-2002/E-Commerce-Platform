import axiosInstance from "@/config/axios";
import type { AdminInventory } from "../types/adminTypes";

export const adminInventoryService = {
  async getAll() {
    const res = await axiosInstance.get<AdminInventory[]>(`/api/admin/inventory`);
    return res.data;
  },

  async getByProduct(productId: number) {
    const res = await axiosInstance.get<AdminInventory>(
      `/api/admin/inventory/product/${productId}`
    );
    return res.data;
  },

  async getLowStock() {
    const res = await axiosInstance.get<AdminInventory[]>(
      `/api/admin/inventory/low-stock`
    );
    return res.data;
  },

  async increase(id: number, amount: number) {
    await axiosInstance.patch(`/api/admin/inventory/${id}/increase?amount=${amount}`);
  },

  async decrease(id: number, amount: number) {
    await axiosInstance.patch(`/api/admin/inventory/${id}/decrease?amount=${amount}`);
  },

  async set(id: number, quantity: number) {
    await axiosInstance.patch(`/api/admin/inventory/${id}/set?quantity=${quantity}`);
  },
};