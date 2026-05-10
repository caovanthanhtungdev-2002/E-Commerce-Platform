import axiosInstance from "@/config/axios";
import type { AdminCoupon, CreateCouponRequest, UpdateCouponRequest } from "../types/adminTypes";

export const adminCouponService = {
  async getAll() {
    const res = await axiosInstance.get<AdminCoupon[]>(`/api/admin/coupons`);
    return res.data;
  },

  async getById(id: number) {
    const res = await axiosInstance.get<AdminCoupon>(`/api/admin/coupons/${id}`);
    return res.data;
  },

  async create(data: CreateCouponRequest) {
    await axiosInstance.post(`/api/admin/coupons`, data);
  },

  async update(id: number, data: UpdateCouponRequest) {
    await axiosInstance.put(`/api/admin/coupons/${id}`, data);
  },

  async enable(id: number) {
    await axiosInstance.patch(`/api/admin/coupons/${id}/enable`);
  },

  async disable(id: number) {
    await axiosInstance.patch(`/api/admin/coupons/${id}/disable`);
  },

  async delete(id: number) {
    await axiosInstance.delete(`/api/admin/coupons/${id}`);
  },
};