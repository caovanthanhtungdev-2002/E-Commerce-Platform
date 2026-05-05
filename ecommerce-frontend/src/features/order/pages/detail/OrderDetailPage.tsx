import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "../../store/orderStore";
import OrderItemCard from "../../component/OrderItemCard";
import styles from "./OrderDetailPage.module.css";
import { formatCurrencyVND } from "@/utils/formatCurrency";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentOrder, fetchOrder, loading } = useOrderStore();

  useEffect(() => {
    if (id) fetchOrder(Number(id));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!currentOrder) return <p>Order not found</p>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <h2>Order #{currentOrder.id}</h2>

        <div className={styles.status}>
          {currentOrder.status === "PAID" && (
            <span className={styles.paid}> Đã thanh toán</span>
          )}
          {currentOrder.status === "PENDING" && (
            <span className={styles.pending}> Chờ thanh toán</span>
          )}
          {currentOrder.status === "CANCELLED" && (
            <span className={styles.cancelled}> Đã huỷ</span>
          )}
        </div>

       {currentOrder.status === "PENDING" && (
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
            <span>Total</span>
            <span>{formatCurrencyVND(currentOrder.totalPrice)}</span>
          </div>

          <div className={styles.row}>
            <span>Discount</span>
            <span>-{formatCurrencyVND(currentOrder.discount)}</span>
          </div>

          <div className={styles.final}>
            <span>Final</span>
            <span>{formatCurrencyVND(currentOrder.finalPrice)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}