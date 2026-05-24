import { create } from "zustand";
import { adminOrderService } from "../services/adminOrderService";
import type { AdminOrder, OrderStatus } from "../types/adminTypes";

interface AdminOrderState {
  orders: AdminOrder[];
  loading: boolean;
  fetch: (page?: number, size?: number) => Promise<void>;
  filter: (params: {
    status?: OrderStatus;
    username?: string;
    from?: string;
    to?: string;
  }) => Promise<void>;
  updateStatus: (id: number, status: OrderStatus) => Promise<void>;
  confirm: (id: number) => Promise<void>;
  cancel: (id: number, reason: string) => Promise<void>;
  refund: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useAdminOrderStore = create<AdminOrderState>((set) => ({
  orders: [],
  loading: false,

  fetch: async (page = 0, size = 20) => {
    set({ loading: true });
    try {
      const data = await adminOrderService.getAll(page, size);
      set({ orders: data });
    } finally {
      set({ loading: false });
    }
  },

  filter: async (params) => {
    set({ loading: true });
    try {
      const data = await adminOrderService.filter(params);
      set({ orders: data });
    } finally {
      set({ loading: false });
    }
  },

  updateStatus: async (id, status) => {
    await adminOrderService.updateStatus(id, status);
  },

  confirm: async (id) => {
    await adminOrderService.confirm(id);
  },

  cancel: async (id, reason) => {
    await adminOrderService.cancel(id, reason);
  },

  refund: async (id) => {
    await adminOrderService.refund(id);
  },

  remove: async (id) => {
    await adminOrderService.delete(id);
  },
}));
