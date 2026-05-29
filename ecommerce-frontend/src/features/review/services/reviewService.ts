import axiosInstance from "@/config/axios";
import type {
  ReviewResponse,
  ReviewSummaryResponse,
  CreateReviewRequest,
  ApiResponse,
  PageResponse,
} from "../types/reviewTypes";

const validateProductId = (productId: number) => {
  console.log("========== PRODUCT ID VALIDATE ==========");
  console.log("productId =", productId);
  console.log("type =", typeof productId);

  if (
    productId === undefined ||
    productId === null ||
    Number.isNaN(productId) ||
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    console.error("[reviewService] productId invalid:", productId);
    throw new Error(`productId không hợp lệ: ${productId}`);
  }
};

export const reviewService = {
  // ================= GET REVIEWS =================
  async getByProduct(productId: number, page = 0, size = 5) {
    validateProductId(productId);
    console.log(`[reviewService] GET /api/reviews/${productId}`);

    const res = await axiosInstance.get<ApiResponse<PageResponse<ReviewResponse>>>(
      `/api/reviews/${productId}?page=${page}&size=${size}`
    );

    console.log("[reviewService] reviews response:", res.data);
    return res.data.data;
  },

  // ================= GET SUMMARY =================
  async getSummary(productId: number) {
    validateProductId(productId);
    console.log(`[reviewService] GET /api/reviews/${productId}/summary`);

    const res = await axiosInstance.get<ApiResponse<ReviewSummaryResponse>>(
      `/api/reviews/${productId}/summary`
    );

    console.log("[reviewService] summary response:", res.data);
    return res.data.data;
  },

  // ================= CREATE REVIEW =================
  async createReview(body: CreateReviewRequest) {
    console.group(" CREATE REVIEW - REQUEST");
    console.log("body          :", body);
    console.log("productId     :", body.productId, `(type: ${typeof body.productId})`);
    console.log("rating        :", body.rating, `(type: ${typeof body.rating})`);
    console.log("comment       :", body.comment, `(length: ${body.comment?.length ?? 0})`);
    console.log("comment empty?:", !body.comment?.trim());
    console.groupEnd();

    validateProductId(body.productId);

    if (body.rating < 1 || body.rating > 5) {
      console.error("[reviewService] rating invalid:", body.rating);
      throw new Error(`rating không hợp lệ: ${body.rating}`);
    }

    if (!body.comment?.trim()) {
      console.error("[reviewService] comment empty");
      throw new Error("Vui lòng nhập nội dung đánh giá");
    }

    console.log("[reviewService] POST /api/reviews →", JSON.stringify(body));

    const res = await axiosInstance.post(`/api/reviews`, body);

    console.group(" CREATE REVIEW - RESPONSE");
    console.log("status  :", res.status);
    console.log("data    :", res.data);
    console.groupEnd();
  },

  async likeReview(reviewId: number) {
    console.log(`[reviewService] POST /api/reviews/${reviewId}/like`);
    await axiosInstance.post(`/api/reviews/${reviewId}/like`);
},

};