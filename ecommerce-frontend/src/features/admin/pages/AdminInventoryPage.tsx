import { useEffect, useState } from "react";
import { useAdminInventoryStore } from "../store/adminStores";
import styles from "./AdminPage.module.css";

export default function AdminInventoryPage() {
  const { inventories, loading, fetch, fetchLowStock, increase, decrease, set } = useAdminInventoryStore();
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<"increase" | "decrease" | "set">("set");
  const [editAmount, setEditAmount] = useState(0);

  useEffect(() => {
    if (lowStockOnly) fetchLowStock();
    else fetch();
  }, [lowStockOnly]);

  const openEdit = (id: number, mode: "increase" | "decrease" | "set") => {
    setEditId(id);
    setEditMode(mode);
    setEditAmount(0);
  };

  const handleUpdate = async () => {
    if (editId == null) return;
    try {
      if (editMode === "increase") await increase(editId, editAmount);
      else if (editMode === "decrease") await decrease(editId, editAmount);
      else await set(editId, editAmount);
      setEditId(null);
      lowStockOnly ? fetchLowStock() : fetch();
    } catch { alert("Cập nhật thất bại"); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Kho hàng</h1>
          <span className={styles.count}>{inventories.length} mặt hàng</span>
        </div>
        <button
          className={lowStockOnly ? styles.btnDel : styles.btnPrimary}
          onClick={() => setLowStockOnly(v => !v)}
        >
          {lowStockOnly ? "⚠️ Đang xem tồn thấp" : "⚠️ Xem tồn thấp"}
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Tồn kho</th>
              <th>Đang giữ</th>
              <th>Khả dụng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.tdCenter}>Đang tải...</td></tr>
            ) : inventories.length === 0 ? (
              <tr><td colSpan={6} className={styles.tdCenter}>Không có dữ liệu</td></tr>
            ) : inventories.map((inv) => {
              const available = inv.stock - inv.reserved;
              const isLow = available < 10;
              return (
                <tr key={inv.productId}>
                  <td className={styles.tdMuted}>#{inv.productId}</td>
                  <td className={styles.tdBold}>{inv.productName || `Product #${inv.productId}`}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: isLow ? "#e53935" : "#1a1d2e" }}>
                      {inv.stock}
                    </span>
                    {isLow && (
                      <span style={{ color: "#e53935", fontSize: "11px", marginLeft: 4 }}>⚠️ Thấp</span>
                    )}
                  </td>
                  <td className={styles.tdMuted}>{inv.reserved}</td>
                  <td className={styles.tdMuted} style={{ color: isLow ? "#e53935" : undefined, fontWeight: isLow ? 700 : undefined }}>
                    {available}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnEdit}   onClick={() => openEdit(inv.productId, "increase")}>+ Nhập</button>
                      <button className={styles.btnToggle} onClick={() => openEdit(inv.productId, "decrease")}>- Xuất</button>
                      <button className={styles.btnDel}    onClick={() => openEdit(inv.productId, "set")}>Đặt lại</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editId != null && (
        <div className={styles.overlay} onClick={() => setEditId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                {editMode === "increase" ? "➕ Nhập thêm hàng" :
                 editMode === "decrease" ? "➖ Xuất hàng" : "🔄 Đặt lại số lượng"}
              </h3>
              <button className={styles.closeBtn} onClick={() => setEditId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.label}>
                {editMode === "set" ? "Số lượng mới" : "Số lượng"}
              </label>
              <input
                className={styles.input}
                type="number"
                min={0}
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setEditId(null)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={handleUpdate}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}