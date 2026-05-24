import { create } from "zustand";
import { categoryService } from "../services/categoryService";
import type { Category } from "../types/categoryTypes";

interface CategoryState {
  categories: Category[];
  tree: Category[];
  page: number;
  totalPages: number;
  loading: boolean;
  fetchCategories: (page?: number) => Promise<void>;
  fetchTree: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  tree: [],
  page: 0,
  totalPages: 0,
  loading: false,

  fetchCategories: async (page = 0) => {
    set({ loading: true });
    try {
      const data = await categoryService.getAll(page, 10);
      set({ categories: data.content, page, totalPages: data.totalPages });
    } catch (err) {
      console.error("Category fetch error:", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchTree: async () => {
    set({ loading: true });
    try {
      const data = await categoryService.getTree();
      set({ tree: data });
    } catch (err) {
      console.error("Category tree fetch error:", err);
    } finally {
      set({ loading: false });
    }
  },
}));