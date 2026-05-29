import React, { useState } from "react";
import StarRating from "./StarRating";
import type { ReviewResponse } from "../types/reviewTypes";
import { reviewService } from "../services/reviewService";

interface ReviewCardProps {
  review: ReviewResponse;
}

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const CheckCircle = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#26aa99">
    <path d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ThumbIcon = ({ filled }: { filled?: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill={filled ? "#ee4d2d" : "none"}
    stroke={filled ? "#ee4d2d" : "currentColor"}
    strokeWidth={2}
  >
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
  </svg>
);

const LIKED_KEY = (id: number) => `review_liked_${id}`;

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount ?? 0);
  const [liked, setLiked] = useState(
    () => localStorage.getItem(LIKED_KEY(review.id)) === "1"
  );
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (liked || loading) return;
    setLoading(true);
    try {
      await reviewService.likeReview(review.id);
      setLiked(true);
      setHelpfulCount((v) => v + 1);
      localStorage.setItem(LIKED_KEY(review.id), "1"); // nhớ đã like, reload không mất
    } catch (e) {
      console.error("Like failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const initial = review.username?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <div
      style={{
        padding: "16px 0",
        borderBottom: "1px solid #f5f5f5",
        display: "flex",
        gap: 12,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "#ffece8",
          color: "#ee4d2d",
          fontWeight: 700,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}
      >
        {initial}
      </div>

      <div style={{ flex: 1 }}>
        {/* Top row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
              {review.username}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#26aa99",
                background: "#e8f8f6",
                borderRadius: 2,
                padding: "1px 6px",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <CheckCircle /> Đã mua hàng
            </span>
          </div>
          <span style={{ fontSize: 11, color: "#bbb" }}>
            {formatDate(review.createdAt)}
          </span>
        </div>

        {/* Stars */}
        <div style={{ margin: "4px 0 6px" }}>
          <StarRating value={review.rating} readonly size="sm" />
        </div>

        {/* Variant tag */}
        <div
          style={{
            fontSize: 11,
            color: "#999",
            background: "#f7f7f7",
            borderRadius: 2,
            padding: "2px 8px",
            display: "inline-block",
            marginBottom: 6,
          }}
        >
          Phân Loại Hàng: Mặc Định
        </div>

        {/* Comment */}
        {review.comment && (
          <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
            {review.comment}
          </div>
        )}

        {/* Image */}
        {review.imageUrl && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <img
              src={review.imageUrl}
              alt="review"
              style={{
                width: 64,
                height: 64,
                borderRadius: 4,
                objectFit: "cover",
                border: "1px solid #f0f0f0",
              }}
            />
          </div>
        )}

        {/* Helpful */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
          }}
        >
          <span style={{ fontSize: 11, color: "#999" }}>
            Đánh giá có hữu ích không?
          </span>
          <button
            onClick={handleLike}
            disabled={liked || loading}
            style={{
              border: `1px solid ${liked ? "#ee4d2d" : "#e0e0e0"}`,
              background: "#fff",
              borderRadius: 2,
              padding: "3px 10px",
              fontSize: 11,
              color: liked ? "#ee4d2d" : "#666",
              cursor: liked || loading ? "default" : "pointer",
              fontFamily: "'Be Vietnam Pro', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.15s",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <ThumbIcon filled={liked} />
            Hữu ích ({helpfulCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;