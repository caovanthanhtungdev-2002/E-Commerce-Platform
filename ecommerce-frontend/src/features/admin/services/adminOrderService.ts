import axiosInstance from "@/config/axios";
import type { AdminOrder, OrderStatus } from "../types/adminTypes";

export const adminOrderService = {
  async getAll(page = 0, size = 20) {
    const res = await axiosInstance.get<AdminOrder[]>(
      `/api/admin/orders?page=${page}&size=${size}`
    );
    return res.data;
  },

  async getById(id: number) {
    const res = await axiosInstance.get<AdminOrder>(`/api/admin/orders/${id}`);
    return res.data;
  },

  async filter(params: {
    status?: OrderStatus;
    username?: string;
    from?: string;
    to?: string;
  }) {
    const p = new URLSearchParams();
    if (params.status) p.append("status", params.status);
    if (params.username) p.append("username", params.username);
    if (params.from) p.append("from", params.from);
    if (params.to) p.append("to", params.to);
    const res = await axiosInstance.get<AdminOrder[]>(
      `/api/admin/orders/filter?${p}`
    );
    return res.data;
  },

  async updateStatus(id: number, status: OrderStatus) {
    await axiosInstance.patch(`/api/admin/orders/${id}/status?status=${status}`);
  },

  async confirm(id: number) {
    await axiosInstance.patch(`/api/admin/orders/${id}/confirm`);
  },

  async cancel(id: number, reason: string) {
    await axiosInstance.patch(
      `/api/admin/orders/${id}/cancel?reason=${encodeURIComponent(reason)}`
    );
  },

  async refund(id: number) {
    await axiosInstance.patch(`/api/admin/orders/${id}/refund`);
  },

  async delete(id: number) {
    await axiosInstance.delete(`/api/admin/orders/${id}`);
  },
};
