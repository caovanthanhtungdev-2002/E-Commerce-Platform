import { create } from "zustand";
import { productService } from "../services/productService";
import type { Product } from "../types/productTypes";

interface ProductState {
  products: Product[];
  page: number;
  totalPages: number;
  loading: boolean;

  fetchProducts: (page?: number) => Promise<void>;
  searchProducts: (keyword: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  page: 0,
  totalPages: 0,
  loading: false,

  fetchProducts: async (page = 0) => {
    set({ loading: true });

    try {
      const data = await productService.getAll(page, 20);

      set({
        products: data.content,
        page,
        totalPages: data.totalPages,
        loading: false,
      });
    } catch (err) {
      console.error("Product fetch error:", err);
      set({ loading: false });
    }
  },

  searchProducts: async (keyword: string) => {
    set({ loading: true });

    try {
      const data = await productService.search({ keyword }, 0, 20);

      set({
        products: data.content,
        page: 0,
        totalPages: data.totalPages,
        loading: false,
      });
    } catch (err) {
      console.error("Search error:", err);
      set({ loading: false });
    }
  },
}));