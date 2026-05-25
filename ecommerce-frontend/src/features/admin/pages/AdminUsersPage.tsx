import { useEffect, useState } from "react";
import { useAdminUserStore } from "../store/adminStores";
import styles from "./AdminPage.module.css";

export default function AdminUsersPage() {
  const { users, loading, fetch, block, activate, remove } = useAdminUserStore();
  const [page, setPage] = useState(0);

  useEffect(() => { fetch(page); }, [page]);

  const handleToggle = async (id: number, enabled: boolean) => {
    try {
      if (enabled) await block(id);
      else await activate(id);
      fetch(page);
    } catch {
      alert("Thao tác thất bại");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa người dùng "${name}"?`)) return;
    try {
      await remove(id);
      fetch(page);
    } catch {
      alert("Xóa thất bại");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Người dùng</h1>
          <span className={styles.count}>{users.length} người dùng</span>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.tdCenter}>Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className={styles.tdCenter}>Không có dữ liệu</td></tr>
            ) : users.map((u) => (
              <tr key={u.id}>
                <td className={styles.tdMuted}>#{u.id}</td>
                <td>
                  <div className={styles.tdBold}>{u.fullName || u.username}</div>
                  <div className={styles.tdMuted}>@{u.username}</div>
                </td>
                <td className={styles.tdMuted}>{u.email}</td>
                <td className={styles.tdMuted}>{u.phone || "—"}</td>
                <td>
                  <span className={`${styles.badge} ${u.role === "ADMIN" ? styles.badgeShipped : styles.badgePaid}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${u.enabled ? styles.badgeActive : styles.badgeInactive}`}>
                    {u.enabled ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.btnToggle}
                      onClick={() => handleToggle(u.id, u.enabled)}
                    >
                      {u.enabled ? "🔒 Khóa" : "✅ Mở"}
                    </button>
                    <button
                      className={styles.btnDel}
                      onClick={() => handleDelete(u.id, u.fullName || u.username)}
                    >
                      Xóa
                    </button>
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
    </div>
  );
}
