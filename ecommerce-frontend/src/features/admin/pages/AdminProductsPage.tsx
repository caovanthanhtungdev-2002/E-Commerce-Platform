import { useEffect, useState } from "react";
import { useAdminProductStore } from "../store/adminStores";
import { useAdminCategoryStore } from "../store/adminStores";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import type { AdminProduct, AdminCreateProductRequest, AdminUpdateProductRequest } from "../types/adminTypes";
import styles from "./AdminPage.module.css";

export default function AdminProductsPage() {
  const { page, loading, fetch, create, update, remove } = useAdminProductStore();
  const { page: catPage, fetch: fetchCats } = useAdminCategoryStore();

  const [currentPage, setCurrentPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<AdminCreateProductRequest>({
    name: "", price: 0, description: "", imageUrl: "", categoryId: undefined, stock: 0,
  });

  useEffect(() => { fetchCats(0, 100); }, []);
  useEffect(() => { fetch({ keyword: keyword || undefined }, currentPage); }, [currentPage, keyword]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", price: 0, description: "", imageUrl: "", categoryId: undefined, stock: 0 });
    setShowModal(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, description: p.description, imageUrl: p.imageUrl, categoryId: p.categoryId });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await update(editing.id, form as AdminUpdateProductRequest);
      } else {
        await create(form);
      }
      setShowModal(false);
      fetch({ keyword: keyword || undefined }, currentPage);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await remove(id);
      fetch({ keyword: keyword || undefined }, currentPage);
    } catch {
      alert("Xóa thất bại");
    }
  };

  const products = page?.content || [];
  const totalPages = page?.totalPages || 1;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Sản phẩm</h1>
          <span className={styles.count}>{page?.totalElements || 0} sản phẩm</span>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>+ Thêm sản phẩm</button>
      </div>

      {/* SEARCH */}
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="🔍 Tìm kiếm sản phẩm..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setCurrentPage(0); }}
        />
      </div>

      {/* TABLE */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Đánh giá</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.tdCenter}>Đang tải...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className={styles.tdCenter}>Không có dữ liệu</td></tr>
            ) : products.map((p) => (
              <tr key={p.id}>
                <td className={styles.tdMuted}>#{p.id}</td>
                <td>
                  <img
                    src={p.imageUrl || "https://placehold.co/40x40/f5f5f5/999?text=SP"}
                    className={styles.thumb}
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/40x40/f5f5f5/999?text=SP"; }}
                  />
                </td>
                <td className={styles.tdBold}>{p.name}</td>
                <td className={styles.tdMuted}>{p.categoryName || "—"}</td>
                <td className={styles.tdPrice}>{formatCurrencyVND(p.price)}</td>
                <td>
                  <span className={styles.rating}>★ {p.avgRating?.toFixed(1) || "—"}</span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnEdit} onClick={() => openEdit(p)}>Sửa</button>
                    <button className={styles.btnDel} onClick={() => handleDelete(p.id, p.name)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className={styles.pagination}>
        <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className={styles.pageBtn}>←</button>
        <span className={styles.pageInfo}>Trang {currentPage + 1} / {totalPages}</span>
        <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className={styles.pageBtn}>→</button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.label}>Tên sản phẩm *</label>
              <input className={styles.input} value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />

              <label className={styles.label}>Giá (VND) *</label>
              <input className={styles.input} type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} />

              <label className={styles.label}>Danh mục</label>
              <select className={styles.input} value={form.categoryId || ""} onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined }))}>
                <option value="">-- Chọn danh mục --</option>
                {catPage?.content.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <label className={styles.label}>URL ảnh</label>
              <input className={styles.input} value={form.imageUrl || ""} onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))} />

              <label className={styles.label}>Mô tả</label>
              <textarea className={styles.textarea} value={form.description || ""} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />

              {!editing && (
                <>
                  <label className={styles.label}>Số lượng kho</label>
                  <input className={styles.input} type="number" value={form.stock || 0} onChange={(e) => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)}>Hủy</button>
              <button className={styles.btnPrimary} onClick={handleSubmit}>
                {editing ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
