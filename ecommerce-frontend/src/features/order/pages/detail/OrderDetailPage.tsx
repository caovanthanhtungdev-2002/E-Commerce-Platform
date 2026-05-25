import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "../../store/orderStore";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useUserStore } from "@/features/user/store/userStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import OrderItemCard from "../../component/OrderItemCard";
import styles from "./OrderDetailPage.module.css";
import { formatCurrencyVND } from "@/utils/formatCurrency";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "⏳ Chờ xác nhận",               className: styles.pending    },
  CONFIRMED:  { label: "✔️ Đang chuẩn bị hàng",         className: styles.confirmed  },
  PROCESSING: { label: "📦 Đang đóng gói",               className: styles.processing },
  SHIPPED:    { label: "🚚 Đang giao hàng",              className: styles.shipped    },
  DELIVERED:  { label: "📬 Đã giao đến tay khách",      className: styles.delivered  },
  PAID:       { label: "💳 Đã thanh toán · Đang xử lý", className: styles.paid       },
  CANCELLED:  { label: "❌ Đã huỷ",                      className: styles.cancelled  },
  REFUNDED:   { label: "💜 Đã hoàn tiền",               className: styles.refunded   },
  COMPLETED:  { label: "🎉 Hoàn tất",                    className: styles.completed  },
  RETURNED:   { label: "🔄 Yêu cầu trả hàng",           className: styles.refunded   },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentOrder, fetchOrder, updateOrderStatus, loading } = useOrderStore();
  const { fetchCart } = useCartStore();
  const { user, fetchProfile } = useUserStore();

  useEffect(() => {
    if (id) {
      fetchOrder(Number(id));
      fetchCart();
    }
    if (!user) fetchProfile();
  }, [id]);

  useWebSocket({
    username: user?.username ?? "",
    onOrderUpdate: (orderId, status) => {
      if (orderId === Number(id)) fetchOrder(Number(id));
    },
    onCartUpdate: () => fetchCart(),
  });

  if (loading && !currentOrder) return <p>Loading...</p>;
  if (!currentOrder) return <p>Order not found</p>;

  const s = statusConfig[currentOrder.status];

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
      <div className={styles.container}>

        <h2>Order #{currentOrder.id}</h2>

        <div className={styles.status}>
          <span className={`${styles.badge} ${s?.className}`}>
            {s?.label ?? currentOrder.status}
          </span>
        </div>

        {/* Thanh toán VNPAY */}
        {currentOrder.status === "PENDING" && currentOrder.paymentMethod === "VNPAY" && (
          <button
            className={styles.payBtn}
            onClick={() => navigate(`/payment/${currentOrder.id}`)}
          >
            Thanh toán ngay
          </button>
        )}

        {/* Xác nhận nhận hàng / trả hàng */}
        {currentOrder.status === "DELIVERED" && (
          <div className={styles.deliveredActions}>
            <p className={styles.deliveredNote}>
              🎁 Bạn đã nhận được hàng chưa? Xác nhận để hoàn tất đơn hàng.
            </p>
            <div className={styles.deliveredBtns}>
              <button
                className={styles.btnConfirmReceived}
                onClick={handleConfirmReceived}
                disabled={loading}
              >
                ✅ Đã nhận được hàng
              </button>
              <button
                className={styles.btnReturn}
                onClick={handleRequestReturn}
                disabled={loading}
              >
                🔄 Yêu cầu trả hàng
              </button>
            </div>
          </div>
        )}

        {/* Đánh giá sau khi COMPLETED */}
        {currentOrder.status === "COMPLETED" && (
          <div className={styles.reviewBox}>
            <p className={styles.reviewNote}>🌟 Đơn hàng hoàn tất! Hãy đánh giá sản phẩm nhé.</p>
            <button
              className={styles.btnReview}
              onClick={() => navigate(`/orders/${currentOrder.id}/review`)}
            >
              ✍️ Đánh giá sản phẩm
            </button>
          </div>
        )}

        <div className={styles.items}>
          {currentOrder.items.map((item) => (
            <OrderItemCard key={item.productId} item={item} />
          ))}
        </div>

        <div className={styles.summary}>
          <div className={styles.row}>
            <span>Tạm tính</span>
            <span>{formatCurrencyVND(currentOrder.totalPrice)}</span>
          </div>
          <div className={styles.row}>
            <span>Giảm giá</span>
            <span>-{formatCurrencyVND(currentOrder.discount)}</span>
          </div>
          <div className={styles.final}>
            <span>Tổng thanh toán</span>
            <span>{formatCurrencyVND(currentOrder.finalPrice)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}