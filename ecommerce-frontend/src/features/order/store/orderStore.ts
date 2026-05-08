import { create } from "zustand";

import * as orderService
  from "../services/orderService";

import type { Order, CreateOrderRequest }
  from "../types/orderTypes";

// ========================================
// STATE
// ========================================

interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  loading: boolean;
  error: string | null;

  create: (payload: CreateOrderRequest) => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  fetchOrders: () => Promise<void>;
}

// ========================================
// STORE
// ========================================

export const useOrderStore =
  create<OrderState>((set) => ({

    currentOrder: null,
    orders: [],
    loading: false,
    error: null,

    // =====================================
    // CREATE ORDER
    // =====================================

    create: async (payload) => {

      try {

        set({ loading: true, error: null });

        const order =
          await orderService.createOrder(payload);

        set({
          currentOrder: order,
          loading: false,
        });

      } catch (err: any) {

        set({
          error:
            err?.response?.data?.message ||
            "Create order failed",
          loading: false,
        });

        throw err;
      }
    },

    // =====================================
    // FETCH ONE
    // =====================================

    fetchOrder: async (id) => {

      try {

        set({ loading: true, error: null });

        const order =
          await orderService.getOrder(id);

        set({
          currentOrder: order,
          loading: false,
        });

      } catch (err: any) {

        set({
          error:
            err?.response?.data?.message ||
            "Fetch order failed",
          loading: false,
        });

      }
    },

    // =====================================
    // FETCH ALL
    // =====================================

    fetchOrders: async () => {

      try {

        set({ loading: true, error: null });

        const orders =
          await orderService.fetchOrders();

        set({
          orders,
          loading: false,
        });

      } catch (err: any) {

        set({
          error:
            err?.response?.data?.message ||
            "Fetch orders failed",
          loading: false,
        });

      }
    },

  }));