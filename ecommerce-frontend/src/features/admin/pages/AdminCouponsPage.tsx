import { useEffect, useState } from "react";
import { useAdminCouponStore } from "../store/adminStores";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import type { AdminCoupon, CreateCouponRequest } from "../types/adminTypes";
import styles from "./AdminPage.module.css";

const EMPTY_FORM: CreateCouponRequest = {
  code: "", discountType: "PERCENT", discountValue: 0,
  minOrderAmount: undefined, maxDiscount: undefined,
  usageLimit: undefined, expiresAt: undefined,
};

export default function AdminCouponsPage() {
  const { coupons, loading, fetch, create, update, enable, disable, remove } = useAdminCouponStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [form, setForm] = useState<CreateCouponRequest>(EMPTY_FORM);

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };

  const openEdit = (c: AdminCoupon) => {
    setEditing(c);
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount, maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit, expiresAt: c.expiresAt,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) await update(editing.id, form);
      else await create(form);
      setShowModal(false);
      fetch();
    } catch (e: any) { alert(e?.response?.data?.message || "Thao tác thất bại"); }
  };

  const handleToggle = async (c: AdminCoupon) => {
    try {
      if (c.active) await disable(c.id);
      else await enable(c.id);
      fetch();
    } catch { alert("Thao tác thất bại"); }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Xóa coupon "${code}"?`)) return;
    try { await remove(id); fetch(); }
    catch { alert("Xóa thất bại"); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Coupon</h1>
          <span className={styles.count}>{coupons.length} coupon</span>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>+ Thêm coupon</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Đơn tối thiểu</th>
              <th>Đã dùng / Giới hạn</th>
              <th>Trạng thái</th>
              <th>Hết hạn</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className={styles.tdCenter}>Đang tải...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={8} className={styles.tdCenter}>Không có coupon</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id}>
                <td><span className={styles.tdBold}>{c.code}</span></td>
                <td className={styles.tdMuted}>{c.discountType === "PERCENT" ? "%" : "VND"}</td>
                <td className={styles.tdPrice}>
                  {c.discountType === "PERCENT" ? `${c.discountValue}%` : formatCurrencyVND(c.discountValue)}
                </td>
                <td className={styles.tdMuted}>
                  {c.minOrderAmount ? formatCurrencyVND(c.minOrderAmount) : "—"}
                </td>
                <td className={styles.tdMuted}>{c.usedCount} / {c.usageLimit ?? "∞"}</td>
                <td>
                  <span className={`${styles.badge} ${c.active ? styles.badgeActive : styles.badgeInactive}`}>
                    {c.active ? "Đang dùng" : "Tắt"}
                  </span>
                </td>
                <td className={styles.tdMuted}>
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("vi-VN") : "—"}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnEdit} onClick={() => openEdit(c)}>Sửa</button>
                    <button className={styles.btnToggle} onClick={() => handleToggle(c)}>
                      {c.active ? "Tắt" : "Bật"}
                    </button>
                    <button className={styles.btnDel} onClick={() => handleDelete(c.id, c.code)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editing ? "Sửa coupon" : "Thêm coupon"}</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.label}>Mã coupon *</label>
              <input className={styles.input} value={form.code} disabled={!!editing}
                onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />

              <label className={styles.label}>Loại giảm giá</label>
              <select className={styles.input} value={form.discountType}
                onChange={(e) => setForm(f => ({ ...f, discountType: e.target.value as any }))}>
                <option value="PERCENT">Phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (VND)</option>
              </select>

              <label className={styles.label}>Giá trị giảm *</label>
              <input className={styles.input} type="number" value={form.discountValue}
                onChange={(e) => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))} />

              <label className={styles.label}>Đơn tối thiểu (VND)</label>
              <input className={styles.input} type="number" value={form.minOrderAmount || ""}
                onChange={(e) => setForm(f => ({ ...f, minOrderAmount: e.target.value ? Number(e.target.value) : undefined }))} />

              <label className={styles.label}>Giảm tối đa (VND)</label>
              <input className={styles.input} type="number" value={form.maxDiscount || ""}
                onChange={(e) => setForm(f => ({ ...f, maxDiscount: e.target.value ? Number(e.target.value) : undefined }))} />

              <label className={styles.label}>Giới hạn sử dụng</label>
              <input className={styles.input} type="number" value={form.usageLimit || ""}
                onChange={(e) => setForm(f => ({ ...f, usageLimit: e.target.value ? Number(e.target.value) : undefined }))} />

              <label className={styles.label}>Ngày hết hạn</label>
              <input className={styles.input} type="date" value={form.expiresAt?.slice(0, 10) || ""}
                onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value || undefined }))} />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={handleSubmit}>{editing ? "Cập nhật" : "Tạo mới"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
