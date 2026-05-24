import { useEffect, useState } from "react";
import { useAdminOrderStore } from "../store/adminStores";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import type { OrderStatus } from "../types/adminTypes";
import styles from "./AdminPage.module.css";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING","CONFIRMED","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"];

const STATUS_BADGE: Record<string, string> = {
  PENDING: styles.badgePending,
  CONFIRMED: styles.badgePaid,
  PAID: styles.badgePaid,
  PROCESSING: styles.badgePaid,
  SHIPPED: styles.badgeShipped,
  DELIVERED: styles.badgePaid,
  CANCELLED: styles.badgeCancelled,
  REFUNDED: styles.badgeRefunded,
};

export default function AdminOrdersPage() {
  // Dùng selector riêng từng field — tránh conflict với browser globals
  const orders       = useAdminOrderStore((s) => s.orders);
  const loading      = useAdminOrderStore((s) => s.loading);
  const fetchOrders  = useAdminOrderStore((s) => s.fetch);
  const filterOrders = useAdminOrderStore((s) => s.filter);
  const updateStatus = useAdminOrderStore((s) => s.updateStatus);
  const confirmOrder = useAdminOrderStore((s) => s.confirm);
  const cancelOrder  = useAdminOrderStore((s) => s.cancel);
  const refundOrder  = useAdminOrderStore((s) => s.refund);
  const removeOrder  = useAdminOrderStore((s) => s.remove);

  const [page, setPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "">("");
  const [filterUsername, setFilterUsername] = useState("");
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (filterStatus || filterUsername) {
      filterOrders({ status: filterStatus || undefined, username: filterUsername || undefined });
    } else {
      fetchOrders(page);
    }
  }, [page, filterStatus, filterUsername]);

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    try {
      await updateStatus(id, status);
      fetchOrders(page);
    } catch {
      alert("Cập nhật thất bại");
    }
  };

  const handleConfirm = async (id: number) => {
  console.log("confirmOrder type:", typeof confirmOrder);
  console.log("confirmOrder value:", confirmOrder);
  try {
    await confirmOrder(id);
    fetchOrders(page);
  } catch (err: any) {
    alert(err?.response?.data?.message || "Xác nhận thất bại");
  }
};

  const handleCancel = async () => {
    if (!cancelId || !cancelReason.trim()) return;
    try {
      await cancelOrder(cancelId, cancelReason);
      setCancelId(null);
      setCancelReason("");
      fetchOrders(page);
    } catch {
      alert("Hủy đơn thất bại");
    }
  };

  const handleRefund = async (id: number) => {
    try {
      await refundOrder(id);
      fetchOrders(page);
    } catch {
      alert("Hoàn tiền thất bại");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeOrder(id);
      fetchOrders(page);
    } catch {
      alert("Xóa thất bại");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Đơn hàng</h1>
          <span className={styles.count}>{orders.length} đơn</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="🔍 Tìm theo username..."
          value={filterUsername}
          onChange={(e) => setFilterUsername(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "")}
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.tdCenter}>Đang tải...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className={styles.tdCenter}>Không có đơn hàng</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id}>
                <td className={styles.tdMuted}>#{o.id}</td>
                <td>
                  <div className={styles.tdBold}>{o.receiverName || o.username}</div>
                  <div className={styles.tdMuted}>{o.phone}</div>
                </td>
                <td className={styles.tdPrice}>{formatCurrencyVND(o.finalPrice)}</td>
                <td>
                  <span className={`${styles.badge} ${STATUS_BADGE[o.status] || ""}`}>{o.status}</span>
                </td>
                <td className={styles.tdMuted}>{o.paymentMethod || "—"}</td>
                <td className={styles.tdMuted}>
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "—"}
                </td>
                <td>
                  <div className={styles.actions}>
                    <select
                      className={styles.filterSelect}
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {o.status === "PENDING" && (
                      <button className={styles.btnToggle} onClick={() => handleConfirm(o.id)}>
                        ✅ Xác nhận
                      </button>
                    )}

                    {["PAID", "DELIVERED"].includes(o.status) && (
                      <button className={styles.btnToggle} onClick={() => handleRefund(o.id)}>↩ Hoàn</button>
                    )}

                    {!["CANCELLED", "REFUNDED"].includes(o.status) && (
                      <button className={styles.btnDel} onClick={() => setCancelId(o.id)}>Hủy</button>
                    )}

                    <button className={styles.btnDel} onClick={() => handleDelete(o.id)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>←</button>
        <span className={styles.pageInfo}>Trang {page + 1}</span>
        <button onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>→</button>
      </div>

      {/* CANCEL MODAL */}
      {cancelId && (
        <div className={styles.overlay} onClick={() => setCancelId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Hủy đơn #{cancelId}</h3>
              <button className={styles.closeBtn} onClick={() => setCancelId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.label}>Lý do hủy *</label>
              <textarea
                className={styles.textarea}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Nhập lý do hủy đơn..."
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setCancelId(null)}>Đóng</button>
              <button className={styles.btnDel} onClick={handleCancel}>Xác nhận hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
