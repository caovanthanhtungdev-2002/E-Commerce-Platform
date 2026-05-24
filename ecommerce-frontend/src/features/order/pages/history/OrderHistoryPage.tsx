import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "../../store/orderStore";
import styles from "./OrderHistoryPage.module.css";
import { formatCurrencyVND } from "@/utils/formatCurrency";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "⏳ Chờ xác nhận",            className: styles.pending    },
  CONFIRMED:  { label: "✔️ Đang chuẩn bị hàng",      className: styles.confirmed  },
  PROCESSING: { label: "📦 Đang đóng gói",            className: styles.processing },
  SHIPPED:    { label: "🚚 Đang giao hàng",           className: styles.shipped    },
  DELIVERED:  { label: "📬 Đã giao đến tay khách",   className: styles.delivered  },
  PAID:       { label: "✅ Đã thanh toán · Đang xử lý", className: styles.paid    },
  CANCELLED:  { label: "❌ Đã huỷ",                   className: styles.cancelled  },
  REFUNDED:   { label: "Đã hoàn tiền",             className: styles.refunded   },
  COMPLETED:  { label: " Hoàn tất",                 className: styles.completed  },
};

export default function OrderHistoryPage() {
  const { orders, fetchOrders, loading } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>My Orders</h2>

        {loading && <p>Loading...</p>}

        {orders.length === 0 && !loading && (
          <p className={styles.empty}>No orders yet</p>
        )}

        <div className={styles.list}>
          {orders.map((order) => {
            const s = statusConfig[order.status];
            return (
              <div
                key={order.id}
                className={styles.card}
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className={styles.left}>
                  <div className={styles.orderId}>
                    Order #{order.id}
                  </div>
                  <span className={`${styles.status} ${s?.className}`}>
                    {s?.label ?? order.status}
                  </span>
                </div>

                <div className={styles.right}>
                  <div className={styles.price}>
                    {formatCurrencyVND(order.finalPrice)}
                  </div>
                  <div className={styles.view}>
                    View details →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
