import axiosInstance from "@/config/axios";
import type { DashboardSummary } from "../types/adminTypes";

export const adminDashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await axiosInstance.get<DashboardSummary>(
      `/api/admin/dashboard/summary`
    );
    return res.data;
  },

  async getRevenue() {
    const res = await axiosInstance.get<[string, number][]>(
      `/api/admin/dashboard/revenue`
    );
    return res.data;
  },

  async getTopProducts() {
    const res = await axiosInstance.get<[string, number][]>(
      `/api/admin/dashboard/top-products`
    );
    return res.data;
  },

  async getOrderStatusStats() {
    const res = await axiosInstance.get<[string, number][]>(
      `/api/admin/dashboard/order-status`
    );
    return res.data;
  },
};