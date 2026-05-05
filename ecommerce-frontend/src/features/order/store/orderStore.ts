import { create } from "zustand";
import * as orderService from "../services/orderService";
import type { Order } from "../types/orderTypes";

interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  loading: boolean;
  error: string | null;

  create: (couponCode?: string) => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  fetchOrders: () => Promise<void>;
  
}

export const useOrderStore = create<OrderState>((set) => ({
  currentOrder: null,
  orders: [],
  loading: false,
  error: null,

  create: async (couponCode) => {
    try {
      set({ loading: true, error: null });

      const order = await orderService.createOrder(couponCode);

      set({ currentOrder: order, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Error", loading: false });
    }
  },

  fetchOrder: async (id) => {
    try {
      set({ loading: true });

      const order = await orderService.getOrder(id);

      set({ currentOrder: order, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchOrders: async () => {
    try {
      set({ loading: true });

      const orders = await orderService.fetchOrders();

      set({ orders, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));