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
  PAID:       { label: " Đã thanh toán · Đang xử lý", className: styles.paid       },
  CANCELLED:  { label: "❌ Đã huỷ",                      className: styles.cancelled  },
  REFUNDED:   { label: "💜 Đã hoàn tiền",               className: styles.refunded   },
  COMPLETED:  { label: "🎉 Hoàn tất",                    className: styles.completed  },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentOrder, fetchOrder, loading } = useOrderStore();
  const { fetchCart } = useCartStore();
  const { user, fetchProfile } = useUserStore(); 

  useEffect(() => {
    if (id) {
      fetchOrder(Number(id));
      fetchCart();
    }
    // fetch profile nếu chưa có
    if (!user) {
      fetchProfile();
    }
  }, [id]);

  //  WebSocket — lắng nghe realtime
  useWebSocket({
    username: user?.username ?? "",
    onOrderUpdate: (orderId, status) => {
      if (orderId === Number(id)) {
        fetchOrder(Number(id));
      }
    },
    onCartUpdate: () => {
      fetchCart();
    },
  });

  if (loading && !currentOrder) return <p>Loading...</p>;
  if (!currentOrder) return <p>Order not found</p>;

  const s = statusConfig[currentOrder.status];

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <h2>Order #{currentOrder.id}</h2>

        <div className={styles.status}>
          <span className={`${styles.badge} ${s?.className}`}>
            {s?.label ?? currentOrder.status}
          </span>
        </div>

        {currentOrder.status === "PENDING" && currentOrder.paymentMethod === "VNPAY" && (
          <button
            className={styles.payBtn}
            onClick={() => navigate(`/payment/${currentOrder.id}`)}
          >
            Thanh toán ngay
          </button>
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