import React from "react";
import StarRating from "./StarRating";
import type { ReviewSummaryResponse } from "../types/reviewTypes";

interface ReviewSummaryProps {
  summary: ReviewSummaryResponse;
  starCounts?: Record<number, number>; // optional: count per star level
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ summary, starCounts }) => {
  const avg = summary.avgRating ?? 0;
  const total = summary.totalReviews;

  // Fallback proportional distribution if no real counts
  const getCount = (star: number) => {
    if (starCounts?.[star] !== undefined) return starCounts[star];
    // rough proportional estimate from avg & total
    if (total === 0) return 0;
    const weights: Record<number, number> = { 5: 0.6, 4: 0.2, 3: 0.1, 2: 0.05, 1: 0.05 };
    return Math.round(total * (weights[star] ?? 0));
  };

  const getWidth = (star: number) => {
    const count = getCount(star);
    if (total === 0) return "0%";
    return `${Math.min((count / total) * 100, 100)}%`;
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "stretch",
        padding: "20px 24px",
      }}
    >
      {/* Left: big number */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 110,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#ee4d2d",
            lineHeight: 1,
          }}
        >
          {avg > 0 ? avg.toFixed(1) : "—"}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
          <StarRating value={Math.round(avg)} readonly size="sm" />
        </div>
        <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>trên 5</div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: "#f0f0f0", alignSelf: "stretch" }} />

      {/* Right: bars */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          justifyContent: "center",
        }}
      >
        {[5, 4, 3, 2, 1].map((star) => (
          <div
            key={star}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#ee4d2d",
                minWidth: 28,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {star}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="#ee4d2d"
                style={{ flexShrink: 0 }}
              >
                <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </span>

            <div
              style={{
                flex: 1,
                height: 6,
                background: "#f0f0f0",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "#ee4d2d",
                  borderRadius: 3,
                  width: getWidth(star),
                  transition: "width 0.6s ease",
                }}
              />
            </div>

            <span
              style={{
                fontSize: 11,
                color: "#999",
                minWidth: 20,
                textAlign: "right",
              }}
            >
              {getCount(star)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSummary;
