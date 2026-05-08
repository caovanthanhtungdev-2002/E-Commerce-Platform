import { create } from "zustand";
import { productService } from "../services/productService";
import type { Product } from "../types/productTypes";

interface SearchBody {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductState {
  products: Product[];
  page: number;
  totalPages: number;
  loading: boolean;

  fetchProducts: (
    page?: number,
    categoryId?: number
  ) => Promise<void>;

  searchProducts: (
    body: SearchBody
  ) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  page: 0,
  totalPages: 0,
  loading: false,

  // ================= FETCH PRODUCTS =================
  fetchProducts: async (
    page = 0,
    categoryId?: number
  ) => {
    set({ loading: true });

    try {
      // nếu có categoryId => search
      if (categoryId) {
        const data = await productService.search(
          { categoryId },
          page,
          20
        );

        set({
          products: data.content,
          page,
          totalPages: data.totalPages,
          loading: false,
        });

        return;
      }

      // không category => lấy all
      const data = await productService.getAll(page, 20);

      set({
        products: data.content,
        page,
        totalPages: data.totalPages,
        loading: false,
      });
    } catch (err) {
      console.error("Product fetch error:", err);

      set({
        loading: false,
      });
    }
  },

  // ================= SEARCH PRODUCTS =================
  searchProducts: async (body: SearchBody) => {
    set({ loading: true });

    try {
      const data = await productService.search(
        body,
        0,
        20
      );

      set({
        products: data.content,
        page: 0,
        totalPages: data.totalPages,
        loading: false,
      });
    } catch (err) {
      console.error("Search error:", err);

      set({
        loading: false,
      });
    }
  },
}));