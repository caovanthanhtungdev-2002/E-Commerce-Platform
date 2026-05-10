import { create } from "zustand";
import { adminProductService } from "../services/adminProductService";
import type {
  AdminProduct,
  AdminCreateProductRequest,
  AdminUpdateProductRequest,
  AdminProductFilter,
  PageResponse,
} from "../types/adminTypes";

interface AdminProductState {
  page: PageResponse<AdminProduct> | null;
  loading: boolean;
  fetch: (filter?: AdminProductFilter, page?: number, size?: number) => Promise<void>;
  create: (data: AdminCreateProductRequest) => Promise<void>;
  update: (id: number, data: AdminUpdateProductRequest) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useAdminProductStore = create<AdminProductState>((set) => ({
  page: null,
  loading: false,

  fetch: async (filter = {}, page = 0, size = 20) => {
    set({ loading: true });
    try {
      const data = await adminProductService.getAll(filter, page, size);
      set({ page: data });
    } finally {
      set({ loading: false });
    }
  },

  create: async (data) => {
    await adminProductService.create(data);
  },

  update: async (id, data) => {
    await adminProductService.update(id, data);
  },

  remove: async (id) => {
    await adminProductService.delete(id);
  },
}));