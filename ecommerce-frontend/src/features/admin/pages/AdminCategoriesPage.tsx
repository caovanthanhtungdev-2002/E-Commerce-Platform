import { useEffect, useState } from "react";
import { useAdminCategoryStore } from "../store/adminStores";
import type { AdminCategory, CreateCategoryRequest } from "../types/adminTypes";
import styles from "./AdminPage.module.css";

export default function AdminCategoriesPage() {
  const { page, loading, fetch, create, update, remove } = useAdminCategoryStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<CreateCategoryRequest>({ name: "", description: "" });

  useEffect(() => { fetch(currentPage); }, [currentPage]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (c: AdminCategory) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) await update(editing.id, form);
      else await create(form);
      setShowModal(false);
      fetch(currentPage);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?`)) return;
    try { await remove(id); fetch(currentPage); }
    catch { alert("Xóa thất bại"); }
  };

  const categories = page?.content || [];
  const totalPages = page?.totalPages || 1;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Danh mục</h1>
          <span className={styles.count}>{page?.totalElements || 0} danh mục</span>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>+ Thêm danh mục</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className={styles.tdCenter}>Đang tải...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className={styles.tdCenter}>Không có dữ liệu</td></tr>
            ) : categories.map((c) => (
              <tr key={c.id}>
                <td className={styles.tdMuted}>#{c.id}</td>
                <td className={styles.tdBold}>{c.name}</td>
                <td className={styles.tdMuted}>{c.description || "—"}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnEdit} onClick={() => openEdit(c)}>Sửa</button>
                    <button className={styles.btnDel} onClick={() => handleDelete(c.id, c.name)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className={styles.pageBtn}>←</button>
        <span className={styles.pageInfo}>Trang {currentPage + 1} / {totalPages}</span>
        <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className={styles.pageBtn}>→</button>
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editing ? "Sửa danh mục" : "Thêm danh mục"}</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.label}>Tên danh mục *</label>
              <input className={styles.input} value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              <label className={styles.label}>Mô tả</label>
              <textarea className={styles.textarea} value={form.description || ""} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
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
