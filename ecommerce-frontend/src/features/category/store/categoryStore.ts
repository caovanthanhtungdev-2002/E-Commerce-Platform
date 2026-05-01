import { create } from "zustand";
import { Category, Page } from "../types/category";
import * as service from "../services/categoryService";

interface CategoryState {
  pageData: Page<Category> | null;
  loading: boolean;
  fetch: (page: number, size: number) => Promise<void>;
  add: (c: Partial<Category>) => Promise<void>;
  update: (id: number, c: Partial<Category>) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  pageData: null,
  loading: false,

  fetch: async (page, size) => {
    set({ loading: true });
    const data = await service.getCategories(page, size);
    set({ pageData: data, loading: false });
  },

  add: async (c) => {
    await service.createCategory(c);
    const state = useCategoryStore.getState();
    await state.fetch(0, 10);
  },

  update: async (id, c) => {
    await service.updateCategory(id, c);
    const state = useCategoryStore.getState();
    await state.fetch(0, 10);
  },

  remove: async (id) => {
    await service.deleteCategory(id);
    const state = useCategoryStore.getState();
    await state.fetch(0, 10);
  },
}));
