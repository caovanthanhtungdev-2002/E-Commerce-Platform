import React, { useEffect, useState } from "react";
import { useReviewStore } from "../../store/reviewStore";
import ReviewSummary from "../../components/ReviewSummary";
import ReviewForm from "../../components/ReviewForm";
import ReviewList from "../../components/ReviewList";

interface ReviewPageProps {
  productId: number;
  productName?: string;
  isLoggedIn: boolean;
}

const PencilIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ee4d2d"
    strokeWidth={2}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4m0 4h.01" />
  </svg>
);

interface ToastProps {
  message: string;
  visible: boolean;
  type?: "success" | "error" | "";
}

const Toast: React.FC<ToastProps> = ({ message, visible, type }) => (
  <div
    style={{
      position: "fixed",
      top: 20,
      right: 20,
      background: type === "success" ? "#26aa99" : "#333",
      color: "#fff",
      fontSize: 13,
      padding: "10px 18px",
      borderRadius: 4,
      zIndex: 999,
      opacity: visible ? 1 : 0,
      pointerEvents: "none",
      transition: "opacity 0.3s",
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontFamily: "'Be Vietnam Pro', sans-serif",
    }}
  >
    {message}
  </div>
);

const ReviewPage: React.FC<ReviewPageProps> = ({
  productId,
  productName = "Sản phẩm",
  isLoggedIn,
}) => {
  const { summary, fetchReviews, fetchSummary } = useReviewStore();

  const [showForm, setShowForm] = useState(false);

  const [toast, setToast] = useState<ToastProps>({
    message: "",
    visible: false,
    type: "",
  });

  useEffect(() => {
    console.log("========== REVIEW PAGE DEBUG ==========");
    console.log("productId:", productId);

    if (
      productId === undefined ||
      productId === null ||
      Number.isNaN(productId) ||
      productId <= 0
    ) {
      console.error("[ReviewPage] productId invalid:", productId);

      setToast({
        message: "productId không hợp lệ",
        visible: true,
        type: "error",
      });

      return;
    }

    fetchReviews(productId);
    fetchSummary(productId);
  }, [productId]);

  const showToast = (
    message: string,
    type: "success" | "error" | "" = ""
  ) => {
    setToast({
      message,
      visible: true,
      type,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        visible: false,
      }));
    }, 2500);
  };

  const handleSuccess = () => {
    setShowForm(false);

    fetchSummary(productId);

    showToast("✓ Đã gửi đánh giá thành công!", "success");
  };

  if (
    productId === undefined ||
    productId === null ||
    Number.isNaN(productId) ||
    productId <= 0
  ) {
    return (
      <div style={{ padding: 20 }}>
        productId không hợp lệ
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap"
      />

      <div
        id="review-section"
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          background: "#f5f5f5",
          padding: 16,
          minHeight: 600,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 4,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              background:
                "linear-gradient(135deg, #ee4d2d 0%, #ff6633 100%)",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  color: "#fff",
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                Đánh Giá Sản Phẩm
              </h2>

              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {productName}
              </p>
            </div>

            {isLoggedIn && (
              <button
                onClick={() => setShowForm((v) => !v)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  color: "#fff",
                  borderRadius: 2,
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                }}
              >
                <PencilIcon />
                Viết Đánh Giá
              </button>
            )}
          </div>

          {/* SUMMARY */}
          {summary && <ReviewSummary summary={summary} />}

          {/* LOGIN NOTICE */}
          {!isLoggedIn && (
            <div
              style={{
                margin: "0 24px 16px",
                padding: "12px 16px",
                background: "#fff8f0",
                border: "1px solid #ffe0cc",
                borderRadius: 2,
                fontSize: 13,
                color: "#555",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <InfoIcon />
              Vui lòng đăng nhập để gửi đánh giá sản phẩm.
            </div>
          )}

          {/* REVIEW LIST */}
          <ReviewList productId={productId} />
        </div>
      </div>

      {/* FORM */}
      {showForm && isLoggedIn && (
        <ReviewForm
          productId={productId}
          onSuccess={handleSuccess}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* TOAST */}
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
      />
    </>
  );
};

export default ReviewPage;