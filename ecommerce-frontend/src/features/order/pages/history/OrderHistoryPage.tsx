import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "../../store/orderStore";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import { getImageSrc } from "@/utils/getImage";
import styles from "./OrderHistoryPage.module.css";
import { formatDate } from '@/utils/dateUtils';

const statusConfig: Record<string, { label: string; color: string }> = {
  AWAITING_PAYMENT: { label: "Chờ thanh toán", color: "#ea580c" },
  PENDING:    { label: "Chờ xác nhận",            color: "#ea580c" },
  CONFIRMED:  { label: "Đang chuẩn bị hàng",      color: "#2563eb" },
  PROCESSING: { label: "Đang đóng gói",            color: "#7c3aed" },
  SHIPPED:    { label: "Đang giao hàng",           color: "#0891b2" },
  DELIVERED:  { label: "Đã giao đến tay khách",   color: "#16a34a" },
  PAID:       { label: "Đã thanh toán",            color: "#16a34a" },
  CANCELLED:  { label: "Đã huỷ",                  color: "#dc2626" },
  REFUNDED:   { label: "Đã hoàn tiền",            color: "#7c3aed" },
  COMPLETED:  { label: "Hoàn tất",                color: "#16a34a" },
  RETURNED:   { label: "Yêu cầu trả hàng",        color: "#d97706" },
};

export default function OrderHistoryPage() {
  const { orders, fetchOrders, loading } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>Đơn hàng của tôi</h2>

        {loading && (
          <div className={styles.loadingBox}>
            <div className={styles.spinner} />
            Đang tải...
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛍️</div>
            <p>Bạn chưa có đơn hàng nào</p>
          </div>
        )}

        <div className={styles.list}>
          {orders.map((order) => {
            const s = statusConfig[order.status];
            const firstItem = order.items?.[0];
            const extraCount = (order.items?.length ?? 1) - 1;

            return (
              <div
                key={order.id}
                className={styles.card}
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                {/* HEADER */}
                <div className={styles.cardHeader}>
                  <span className={styles.orderId}>#{order.id}</span>
                  <span className={styles.statusBadge} style={{ color: s?.color, background: s?.color + "18" }}>
                    {s?.label ?? order.status}
                  </span>
                </div>

                {/* PREVIEW SẢN PHẨM */}
                {firstItem && (
                  <div className={styles.previewRow}>
                    <div className={styles.previewImgWrap}>
                      <img
                        src={getImageSrc(firstItem.imageUrl)}
                        alt={firstItem.productName}
                        className={styles.previewImg}
                        onError={(e) => { e.currentTarget.src = "https://picsum.photos/56"; }}
                      />
                    </div>
                    <div className={styles.previewInfo}>
                      <div className={styles.previewName}>{firstItem.productName}</div>
                      <div className={styles.previewQty}>x{firstItem.quantity}</div>
                    </div>
                    {extraCount > 0 && (
                      <span className={styles.extraCount}>+{extraCount} sản phẩm</span>
                    )}
                  </div>
                )}

                {/* FOOTER */}
                <div className={styles.cardFooter}>
  {order.createdAt && (
    <span className={styles.orderTime}>
       {formatDate(order.createdAt)}
    </span>
  )}
  <span className={styles.totalLabel}>Thành tiền:</span>
  <span className={styles.totalPrice}>{formatCurrencyVND(order.finalPrice)}</span>
  <span className={styles.viewDetail}>Xem chi tiết →</span>
</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}