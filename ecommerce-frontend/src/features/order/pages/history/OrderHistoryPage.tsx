import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "../../store/orderStore";
import styles from "./OrderHistoryPage.module.css";
import { formatCurrencyVND } from "@/utils/formatCurrency";

export default function OrderHistoryPage() {
  const { orders, fetchOrders, loading } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PAID":
        return styles.paid;
      case "PENDING":
        return styles.pending;
      case "CANCELLED":
        return styles.cancelled;
      default:
        return "";
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>My Orders</h2>

        {loading && <p>Loading...</p>}

        {orders.length === 0 && !loading && (
          <p className={styles.empty}>No orders yet</p>
        )}

        <div className={styles.list}>
          {orders.map((order) => (
            <div
              key={order.id}
              className={styles.card}
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className={styles.left}>
                <div className={styles.orderId}>
                  Order #{order.id}
                </div>

                <span
                  className={`${styles.status} ${getStatusClass(order.status)}`}
                >
                  {order.status}
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
          ))}
        </div>
      </div>
    </div>
  );
}