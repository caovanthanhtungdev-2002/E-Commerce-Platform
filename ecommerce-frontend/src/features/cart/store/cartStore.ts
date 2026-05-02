import { create } from "zustand";
import { cartService } from "../services/cartService";
import type { CartItem } from "../types/cartTypes";

interface CartState {
  items: CartItem[];
  totalPrice: number;
  loading: boolean;

  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;

  // 👇 FIX
  toggleSelect: (productId: number) => void;
  updateQuantity: (productId: number, newQty: number) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalPrice: 0,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });

    try {
      const data = await cartService.getCart();

      set({
        items: data.items.map((i) => ({
          ...i,
          selected: true, // mặc định chọn hết
        })),
        totalPrice: data.totalPrice,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  addToCart: async (productId, quantity) => {
    await cartService.add(productId, quantity);
    await get().fetchCart();
  },

  removeFromCart: async (productId) => {
    await cartService.remove(productId);

    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }));
  },

  clearCart: async () => {
    await cartService.clear();
    set({ items: [], totalPrice: 0 });
  },

  // ✅ FIX toggle
  toggleSelect: (productId) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? { ...item, selected: !item.selected }
          : item
      ),
    }));
  },

  // ✅ FIX update quantity
  updateQuantity: async (productId, newQty) => {
    const item = get().items.find((i) => i.productId === productId);
    if (!item) return;

    if (newQty <= 0) {
      await get().removeFromCart(productId);
      return;
    }

    const diff = newQty - item.quantity;

    if (diff > 0) {
      // tăng
      await cartService.add(productId, diff);
    } else if (diff < 0) {
      // giảm → phải remove rồi add lại
      await cartService.remove(productId);
      await cartService.add(productId, newQty);
    }

    await get().fetchCart();
  },
}));