import { create } from "zustand";
import { reviewService } from "../services/reviewService";
import type {
  ReviewResponse,
  ReviewSummaryResponse,
  CreateReviewRequest,
} from "../types/reviewTypes";

interface ReviewState {
  reviews: ReviewResponse[];
  summary: ReviewSummaryResponse | null;
  page: number;
  totalPages: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;

  fetchReviews: (productId: number, page?: number) => Promise<void>;
  fetchSummary: (productId: number) => Promise<void>;
  submitReview: (body: CreateReviewRequest) => Promise<boolean>;
  clearError: () => void;
}

const logError = (label: string, err: any) => {
  console.group(`❌ ${label}`);
  console.error("message        :", err?.message);
  console.error("status         :", err?.response?.status);
  console.error("statusText     :", err?.response?.statusText);
  console.error("response.data  :", err?.response?.data);
  console.error("request URL    :", err?.config?.url);
  console.error("request method :", err?.config?.method?.toUpperCase());
  console.error("request body   :", (() => {
    try { return JSON.parse(err?.config?.data); }
    catch { return err?.config?.data; }
  })());
  console.error("request headers:", err?.config?.headers);
  console.error("full error obj :", err);
  console.groupEnd();
};

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: [],
  summary: null,
  page: 0,
  totalPages: 0,
  loading: false,
  submitting: false,
  error: null,

  // ================= FETCH REVIEWS =================
  fetchReviews: async (productId, page = 0) => {
    set({ loading: true, error: null });

    try {
      const data = await reviewService.getByProduct(productId, page);

      set({
        reviews: data.content,
        page,
        totalPages: data.totalPages,
        loading: false,
      });
    } catch (err: any) {
      logError("FETCH REVIEWS ERROR", err);

      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải đánh giá",
      });
    }
  },

  // ================= FETCH SUMMARY =================
  fetchSummary: async (productId) => {
    set({ error: null });

    try {
      const data = await reviewService.getSummary(productId);
      set({ summary: data });
    } catch (err: any) {
      logError("FETCH SUMMARY ERROR", err);

      set({
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải tổng đánh giá",
        summary: null,
      });
    }
  },

  // ================= SUBMIT REVIEW =================
  submitReview: async (body) => {
    console.group(" SUBMIT REVIEW");
    console.log("body:", body);
    console.groupEnd();

    set({ submitting: true, error: null });

    try {
      await reviewService.createReview(body);

      const [updated, summary] = await Promise.all([
        reviewService.getByProduct(body.productId, 0),
        reviewService.getSummary(body.productId),
      ]);

      set({
        reviews: updated.content,
        page: 0,
        totalPages: updated.totalPages,
        summary,
        submitting: false,
      });

      console.log("SUBMIT REVIEW SUCCESS");
      return true;
    } catch (err: any) {
      logError("SUBMIT REVIEW ERROR", err);

      set({
        submitting: false,
        error:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.errors?.join(", ") ||
          err?.message ||
          "Gửi đánh giá thất bại",
      });

      return false;
    }
  },

  // ================= CLEAR ERROR =================
  clearError: () => set({ error: null }),
}));