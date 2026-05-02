import { create } from "zustand";
import { categoryService } from "../services/categoryService";
import type { Category } from "../types/categoryTypes";

interface CategoryState {
  categories: Category[];
  page: number;
  totalPages: number;
  loading: boolean;

  fetchCategories: (page?: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  page: 0,
  totalPages: 0,
  loading: false,

  fetchCategories: async (page = 0) => {
    set({ loading: true });

    try {
      const data = await categoryService.getAll(page, 10);

      set({
        categories: data.content,
        page,
        totalPages: data.totalPages,
        loading: false,
      });
    } catch (err) {
      console.error("Category fetch error:", err);
      set({ loading: false });
    }
  },
}));