import { create } from "zustand";
import { adminCategoryService } from "../services/adminCategoryService";
import type {
  AdminCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PageResponse,
} from "../types/adminTypes";

interface AdminCategoryState {
  page: PageResponse<AdminCategory> | null;
  loading: boolean;
  fetch: (page?: number, size?: number) => Promise<void>;
  create: (data: CreateCategoryRequest) => Promise<void>;
  update: (id: number, data: UpdateCategoryRequest) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useAdminCategoryStore = create<AdminCategoryState>((set) => ({
  page: null,
  loading: false,

  fetch: async (page = 0, size = 20) => {
    set({ loading: true });
    try {
      const data = await adminCategoryService.getAll(page, size);
      set({ page: data });
    } finally {
      set({ loading: false });
    }
  },

  create: async (data) => {
    await adminCategoryService.create(data);
  },

  update: async (id, data) => {
    await adminCategoryService.update(id, data);
  },

  remove: async (id) => {
    await adminCategoryService.delete(id);
  },
}));