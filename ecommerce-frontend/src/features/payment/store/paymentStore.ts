import { create } from "zustand";
import { createPayment } from "../services/paymentService";

interface PaymentState {
  loading: boolean;
  pay: (orderId: number) => Promise<string | null>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  loading: false,

  pay: async (orderId) => {
    try {
      set({ loading: true });

      const res = await createPayment(orderId);

      return res.paymentUrl;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));