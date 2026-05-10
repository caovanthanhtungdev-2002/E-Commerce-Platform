import { create } from "zustand";
import { adminCouponService } from "../services/adminCouponService";
import type { AdminCoupon, CreateCouponRequest, UpdateCouponRequest } from "../types/adminTypes";

interface AdminCouponState {
  coupons: AdminCoupon[];
  loading: boolean;
  fetch: () => Promise<void>;
  create: (data: CreateCouponRequest) => Promise<void>;
  update: (id: number, data: UpdateCouponRequest) => Promise<void>;
  enable: (id: number) => Promise<void>;
  disable: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useAdminCouponStore = create<AdminCouponState>((set) => ({
  coupons: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const data = await adminCouponService.getAll();
      set({ coupons: data });
    } finally {
      set({ loading: false });
    }
  },

  create: async (data) => {
    await adminCouponService.create(data);
  },

  update: async (id, data) => {
    await adminCouponService.update(id, data);
  },

  enable: async (id) => {
    await adminCouponService.enable(id);
  },

  disable: async (id) => {
    await adminCouponService.disable(id);
  },

  remove: async (id) => {
    await adminCouponService.delete(id);
  },
}));