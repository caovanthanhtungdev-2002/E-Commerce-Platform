import axiosInstance from "@/config/axios";
import type { AdminUser } from "../types/adminTypes";

export const adminUserService = {
  async getAll(page = 0, size = 20) {
    const res = await axiosInstance.get<AdminUser[]>(
      `/api/admin/users?page=${page}&size=${size}`
    );
    return res.data;
  },

  async block(id: number) {
    await axiosInstance.patch(`/api/admin/users/${id}/block`);
  },

  async activate(id: number) {
    await axiosInstance.patch(`/api/admin/users/${id}/activate`);
  },

  async delete(id: number) {
    await axiosInstance.delete(`/api/admin/users/${id}`);
  },
};