import React, { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const RATING_LABELS: Record<number, string> = {
  1: "Tệ",
  2: "Không hài lòng",
  3: "Bình thường",
  4: "Hài lòng",                                                                                    
  5: "Tuyệt vời",
};

const sizePx: Record<string, number> = { sm: 14, md: 20, lg: 32 };

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = "md",
}) => {
  const [hovered, setHovered] = useState(0);
  const px = sizePx[size];
  const active = hovered || value;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = active >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            style={{
              width: px,
              height: px,
              padding: 0,
              border: "none",
              background: "none",
              cursor: readonly ? "default" : "pointer",
              transition: "transform 0.1s",
              transform: !readonly && hovered >= star ? "scale(1.18)" : "scale(1)",
              flexShrink: 0,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width={px}
              height={px}
              fill={filled ? "#ee4d2d" : "none"}
              stroke={filled ? "#ee4d2d" : "#e0e0e0"}
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </button>
        );
      })}
      {!readonly && size === "lg" && hovered > 0 && (
        <span style={{ fontSize: 12, color: "#ee4d2d", marginLeft: 6, fontWeight: 500 }}>
          {RATING_LABELS[hovered]}
        </span>
      )}
    </div>
  );
};

export default StarRating;
