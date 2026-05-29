import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "../../store/orderStore";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useUserStore } from "@/features/user/store/userStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import OrderItemCard from "../../component/OrderItemCard";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import styles from "./OrderDetailPage.module.css";

const STATUS_STEPS = [
  { key: "PENDING",    label: "Đặt hàng"  },
  { key: "CONFIRMED",  label: "Xác nhận"  },
  { key: "PROCESSING", label: "Đóng gói"  },
  { key: "SHIPPED",    label: "Đang giao" },
  { key: "DELIVERED",  label: "Đã giao"   },
  { key: "COMPLETED",  label: "Hoàn tất"  },
];

const CANCELLED_STATUSES = new Set(["CANCELLED", "REFUNDED", "RETURNED"]);

const statusLabel: Record<string, string> = {
  PENDING:    "Chờ xác nhận",
  CONFIRMED:  "Đang chuẩn bị hàng",
  PROCESSING: "Đang đóng gói",
  SHIPPED:    "Đang giao hàng",
  DELIVERED:  "Đã giao đến tay khách",
  PAID:       "Đã thanh toán · Đang xử lý",
  CANCELLED:  "Đã huỷ",
  REFUNDED:   "Đã hoàn tiền",
  COMPLETED:  "Hoàn tất",
  RETURNED:   "Yêu cầu trả hàng",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentOrder, fetchOrder, updateOrderStatus, loading } = useOrderStore();
  const { fetchCart } = useCartStore();
  const { user, fetchProfile } = useUserStore();

  useEffect(() => {
    if (id) { fetchOrder(Number(id)); fetchCart(); }
    if (!user) fetchProfile();
  }, [id]);

  useWebSocket({
    username: user?.username ?? "",
    onOrderUpdate: (orderId) => { if (orderId === Number(id)) fetchOrder(Number(id)); },
    onCartUpdate: () => fetchCart(),
  });

  if (loading && !currentOrder) return <div className={styles.loading}><div className={styles.spinner} />Đang tải...</div>;
  if (!currentOrder) return <div className={styles.loading}>Không tìm thấy đơn hàng</div>;

  const isCancelled = CANCELLED_STATUSES.has(currentOrder.status);
  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === currentOrder.status);

  const handleConfirmReceived = async () => {
    if (!confirm("Xác nhận bạn đã nhận được hàng?")) return;
    await updateOrderStatus(currentOrder.id, "COMPLETED");
    fetchOrder(currentOrder.id);
  };

  const handleRequestReturn = async () => {
    if (!confirm("Bạn muốn yêu cầu trả hàng / hoàn tiền?")) return;
    await updateOrderStatus(currentOrder.id, "RETURNED");
    fetchOrder(currentOrder.id);
  };

  return (
    <div className={styles.page}>

      {/* STATUS CARD */}
      <div className={styles.card}>
        <div className={styles.statusBar}>
          <div className={styles.orderId}>
            Mã đơn hàng: <span>#{currentOrder.id}</span>
          </div>
          <div className={`${styles.statusLabel} ${isCancelled ? styles.statusCancelled : styles.statusActive}`}>
            {statusLabel[currentOrder.status] ?? currentOrder.status}
          </div>
        </div>

        {/* TIMELINE — chỉ hiện khi không bị huỷ */}
        {!isCancelled && (
          <div className={styles.timeline}>
            {STATUS_STEPS.map((step, idx) => {
              const done = idx < currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <div key={step.key} className={`${styles.tlStep} ${done ? styles.done : ""} ${active ? styles.active : ""}`}>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`${styles.tlLine} ${done ? styles.lineDone : ""}`} />
                  )}
                  <div className={styles.tlDot}>
                    {done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div className={styles.tlLabel}>{step.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* CANCELLED BANNER */}
        {isCancelled && (
          <div className={styles.cancelledBanner}>
            {statusLabel[currentOrder.status]}
          </div>
        )}
      </div>

      {/* ADDRESS + PAYMENT */}
      <div className={styles.card}>
        <div className={styles.addrBlock}>
          <div className={styles.addrIcon}>📍</div>
          <div className={styles.addrInfo}>
            <div className={styles.addrName}>
              {currentOrder.receiverName}
              <span className={styles.addrDot}>·</span>
              <span className={styles.addrPhone}>{currentOrder.phone}</span>
            </div>
            <div className={styles.addrText}>{currentOrder.address}</div>
          </div>
        </div>
        <div className={styles.payRow}>
          <span className={styles.payLabel}>Phương thức thanh toán</span>
          <span className={styles.payValue}>
            <span className={styles.payBadge}>{currentOrder.paymentMethod}</span>
            {currentOrder.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : "Thanh toán online"}
          </span>
        </div>
      </div>

      {/* ITEMS */}
      <div className={styles.card}>
        <div className={styles.sectionTitle}>Sản phẩm</div>
        {currentOrder.items.map((item) => (
          <OrderItemCard key={item.productId} item={item} />
        ))}

        <div className={styles.summary}>
          <div className={styles.sumRow}>
            <span>Tạm tính</span>
            <span>{formatCurrencyVND(currentOrder.totalPrice)}</span>
          </div>
          {currentOrder.discount > 0 && (
            <div className={styles.sumRow}>
              <span>Giảm giá</span>
              <span className={styles.discount}>-{formatCurrencyVND(currentOrder.discount)}</span>
            </div>
          )}
          <div className={styles.sumFinal}>
            <span>Tổng thanh toán</span>
            <span>{formatCurrencyVND(currentOrder.finalPrice)}</span>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      {currentOrder.status === "PENDING" && currentOrder.paymentMethod === "VNPAY" && (
        <div className={styles.card}>
          <div className={styles.actionBox}>
            <p className={styles.actionNote}>Đơn hàng chưa được thanh toán. Vui lòng thanh toán để tiếp tục.</p>
            <button className={styles.btnPrimary} onClick={() => navigate(`/payment/${currentOrder.id}`)}>
              Thanh toán ngay
            </button>
          </div>
        </div>
      )}

      {currentOrder.status === "DELIVERED" && (
        <div className={styles.card}>
          <div className={styles.actionBox}>
            <p className={styles.actionNote}>🎁 Bạn đã nhận được hàng chưa? Xác nhận để hoàn tất đơn hàng.</p>
            <div className={styles.actionBtns}>
              <button className={styles.btnPrimary} onClick={handleConfirmReceived} disabled={loading}>
                ✅ Đã nhận được hàng
              </button>
              <button className={styles.btnSecondary} onClick={handleRequestReturn} disabled={loading}>
                🔄 Yêu cầu trả hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {currentOrder.status === "COMPLETED" && (
  <div className={styles.card}>
    <div className={styles.reviewBox}>
      <p className={styles.reviewNote}>
        🌟 Đơn hàng hoàn tất! Hãy đánh giá sản phẩm nhé.
      </p>

      <div className={styles.reviewProducts}>
        {currentOrder.items.map((item) => (
          <button
            key={item.productId}
            className={styles.btnReview}
            onClick={() =>
              navigate(`/products/${item.productId}/reviews`)
            }
          >
            ✍️ Đánh giá {item.productName}
          </button>
        ))}
      </div>
    </div>
  </div>
)}

    </div>
  );
}