import axiosInstance from "@/config/axios";
import type {
  AdminUser,
  AdminCoupon,
  CreateCouponRequest,
  UpdateCouponRequest,
  AdminInventory,
  DashboardSummary,
} from "../types/adminTypes";

// ========== USER SERVICE ==========
export const adminUserService = {
  async getAll(page = 0, size = 20) {
    const res = await axiosInstance.get(`/api/admin/users?page=${page}&size=${size}`);
    console.log("users response:", res.data);
    return Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
  },

  async block(id: number) {
    await axiosInstance.patch(`/api/admin/users/${id}/block`);
  },

  async activate(id: number) {
    await axiosInstance.patch(`/api/admin/users/${id}/activate`);
  },

 
  async assignRole(id: number, role: string) {
    await axiosInstance.patch(`/api/admin/users/${id}/role`, { role });
  },

 
  async removeRole(id: number) {
    await axiosInstance.delete(`/api/admin/users/${id}/role`);
  },

  async delete(id: number) {
    await axiosInstance.delete(`/api/admin/users/${id}`);
  },
};

// ========== COUPON SERVICE ==========
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

// ========== INVENTORY SERVICE ==========
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

// ========== DASHBOARD SERVICE ==========
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

  async getCodReport() {
    const res = await axiosInstance.get(`/api/admin/dashboard/cod`);
    return res.data;
  },
};