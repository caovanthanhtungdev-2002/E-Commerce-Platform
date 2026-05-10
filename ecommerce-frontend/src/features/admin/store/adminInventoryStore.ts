import { create } from "zustand";
import { adminInventoryService } from "../services/adminInventoryService";
import type { AdminInventory } from "../types/adminTypes";

interface AdminInventoryState {
  inventories: AdminInventory[];
  loading: boolean;
  fetch: () => Promise<void>;
  fetchLowStock: () => Promise<void>;
  increase: (id: number, amount: number) => Promise<void>;
  decrease: (id: number, amount: number) => Promise<void>;
  set: (id: number, quantity: number) => Promise<void>;
}

export const useAdminInventoryStore = create<AdminInventoryState>((set) => ({
  inventories: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const data = await adminInventoryService.getAll();
      set({ inventories: data });
    } finally {
      set({ loading: false });
    }
  },

  fetchLowStock: async () => {
    set({ loading: true });
    try {
      const data = await adminInventoryService.getLowStock();
      set({ inventories: data });
    } finally {
      set({ loading: false });
    }
  },

  increase: async (id, amount) => {
    await adminInventoryService.increase(id, amount);
  },

  decrease: async (id, amount) => {
    await adminInventoryService.decrease(id, amount);
  },

  set: async (id, quantity) => {
    await adminInventoryService.set(id, quantity);
  },
}));