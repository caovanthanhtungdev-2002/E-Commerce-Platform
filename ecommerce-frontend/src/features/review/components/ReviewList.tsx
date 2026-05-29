import React, { useState } from "react";
import ReviewCard from "./ReviewCard";
import { useReviewStore } from "../store/reviewStore";

interface ReviewListProps {
  productId: number;
}

type Filter = "all" | "5" | "4" | "3" | "2" | "1" | "img";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "Tất Cả", value: "all" },
  { label: "5 Sao", value: "5" },
  { label: "4 Sao", value: "4" },
  { label: "3 Sao", value: "3" },
  { label: "Có Hình Ảnh", value: "img" },
];

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const {
    reviews,
    loading,
    page,
    totalPages,
    fetchReviews,
  } = useReviewStore();

  const [activeFilter, setActiveFilter] =
    useState<Filter>("all");

  if (
    productId === undefined ||
    productId === null ||
    Number.isNaN(productId) ||
    productId <= 0
  ) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        productId không hợp lệ
      </div>
    );
  }

  const handleFilter = (f: Filter) => {
    setActiveFilter(f);

    fetchReviews(productId, 0);
  };

  const handlePage = (p: number) => {
    fetchReviews(productId, p);

    document
      .getElementById("review-section")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const filtered = reviews.filter((r) => {
    if (activeFilter === "all") return true;

    if (activeFilter === "img") {
      return !!r.imageUrl;
    }

    return r.rating === Number(activeFilter);
  });

  return (
    <div>
      {/* FILTERS */}
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          borderTop: "1px solid #f5f5f5",
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            style={{
              border:
                activeFilter === f.value
                  ? "1px solid #ee4d2d"
                  : "1px solid #e0e0e0",
              background:
                activeFilter === f.value
                  ? "#fff8f6"
                  : "#fff",
              color:
                activeFilter === f.value
                  ? "#ee4d2d"
                  : "#555",
              padding: "6px 14px",
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div style={{ padding: "0 24px" }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            Đang tải đánh giá...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: "#999",
            }}
          >
            Chưa có đánh giá nào
          </div>
        ) : (
          filtered.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
            />
          ))
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            padding: 20,
          }}
        >
          <button
            disabled={page === 0}
            onClick={() => handlePage(page - 1)}
          >
            Prev
          </button>

          <span>
            {page + 1} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages - 1}
            onClick={() => handlePage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;