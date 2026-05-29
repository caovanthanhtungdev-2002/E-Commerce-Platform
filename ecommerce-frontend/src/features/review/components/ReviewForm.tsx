import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";
import { useReviewStore } from "../store/reviewStore";

interface ReviewFormProps {
  productId: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Tệ",
  2: "Không hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Tuyệt vời",
};

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onSuccess,
  onClose,
}) => {
  const {
    submitting,
    error,
    submitReview,
    clearError,
  } = useReviewStore();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingError, setRatingError] = useState("");

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);

    return () =>
      document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setRatingError("Vui lòng chọn số sao!");
      return;
    }

    setRatingError("");

    const ok = await submitReview({
      productId,
      rating,
      comment,
    });

    if (ok) {
      setRating(0);
      setComment("");
      onSuccess?.();
    }
  };

  // FIX INVALID PRODUCT ID
  if (
    productId === undefined ||
    productId === null ||
    Number.isNaN(productId)
  ) {
    console.error(
      "[ReviewForm] invalid productId:",
      productId
    );

    return (
      <div
        style={{
          padding: 20,
          color: "red",
        }}
      >
        ❌ productId không hợp lệ
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 4,
          width: 480,
          maxWidth: "95vw",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            background: "#ee4d2d",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              margin: 0,
            }}
          >
            Đánh Giá Sản Phẩm
          </h3>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.85)",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 13,
              color: "#555",
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            Chất lượng sản phẩm
          </div>

          <div style={{ marginBottom: 4 }}>
            <StarRating
              value={rating}
              onChange={setRating}
              size="lg"
            />
          </div>

          <p
            style={{
              fontSize: 12,
              color: "#ee4d2d",
              marginBottom: 14,
              minHeight: 16,
            }}
          >
            {ratingError ||
              (rating > 0
                ? RATING_LABELS[rating]
                : "")}
          </p>

          {/* Textarea */}
          <textarea
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            maxLength={1000}
            rows={4}
            placeholder="Hãy chia sẻ cảm nhận..."
            style={{
              width: "100%",
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              padding: "10px 12px",
              fontSize: 13,
              resize: "none",
            }}
          />

          <div
            style={{
              fontSize: 11,
              color: "#bbb",
              textAlign: "right",
              marginTop: 4,
            }}
          >
            {comment.length}/1000
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: 10,
                background: "#fff5f5",
                border: "1px solid #ffcdd2",
                padding: "8px 12px",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#e53935",
                }}
              >
                {error}
              </span>

              <button onClick={clearError}>
                ✕
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%",
              background: submitting
                ? "#f7c0b4"
                : "#ee4d2d",
              color: "#fff",
              border: "none",
              padding: 11,
              marginTop: 14,
              cursor: submitting
                ? "default"
                : "pointer",
            }}
          >
            {submitting
              ? "Đang gửi..."
              : "Gửi Đánh Giá"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;