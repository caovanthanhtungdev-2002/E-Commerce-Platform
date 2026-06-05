import { create } from "zustand";
import * as orderService from "../services/orderService";
import type { Order, CreateOrderRequest , OrderStatus} from "../types/orderTypes";
import { useCartStore } from "@/features/cart/store/cartStore";


interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  loading: boolean;
  error: string | null;
  setOrderStatus: (orderId: number, status: string) => void;
  refreshOrder: (id: number) => Promise<void>;


  create: (payload: CreateOrderRequest) => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: number, status: string) => Promise<void>;
  confirmCOD: (orderId: number) => Promise<void>; // ← MỚI
}

export const useOrderStore = create<OrderState>((set) => ({
  currentOrder: null,
  orders: [],
  loading: false,
  error: null,

setOrderStatus: (orderId, status) => {
  set((state) => ({
    currentOrder:
      state.currentOrder?.id === orderId
        ? { ...state.currentOrder, status: status as OrderStatus }
        : state.currentOrder,
    orders: state.orders.map((o) =>
      o.id === orderId ? { ...o, status: status as OrderStatus } : o
    ),
  }));
},
refreshOrder: async (id) => {
  try {
    const order = await orderService.getOrder(id);
    set({ currentOrder: order });
  } catch {
    
  }
},
  create: async (payload) => {
    try {
      set({ loading: true, error: null });
      const order = await orderService.createOrder(payload);
      set({ currentOrder: order, loading: false });
      await useCartStore.getState().fetchCart();
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Create order failed", loading: false });
      throw err;
    }
  },

  fetchOrder: async (id) => {
    try {
      set({ loading: true, error: null });
      const order = await orderService.getOrder(id);
      set({ currentOrder: order, loading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Fetch order failed", loading: false });
    }
  },

  fetchOrders: async () => {
    try {
      set({ loading: true, error: null });
      const orders = await orderService.fetchOrders();
      set({ orders, loading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Fetch orders failed", loading: false });
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      set({ loading: true, error: null });
      const order = await orderService.updateOrderStatus(id, status);
      set({ currentOrder: order, loading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Update status failed", loading: false });
      throw err;
    }
  },

  
  confirmCOD: async (orderId) => {
    try {
      set({ loading: true, error: null });
      await orderService.confirmCOD(orderId);
      // Refetch để lấy status COMPLETED mới nhất
      const order = await orderService.getOrder(orderId);
      set({ currentOrder: order, loading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || "Confirm COD failed", loading: false });
      throw err;
    }
  },
}));