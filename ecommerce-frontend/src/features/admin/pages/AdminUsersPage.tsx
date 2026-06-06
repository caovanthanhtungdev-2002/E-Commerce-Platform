import { useEffect, useState } from "react";
import { useAdminUserStore } from "../store/adminStores";
import { useAuthStore } from "../../auth/store/authStore";
import styles from "./AdminPage.module.css";

const ROLES = ["USER", "STAFF", "WAREHOUSE", "SHIPPER", "MANAGER", "ADMIN"];

export default function AdminUsersPage() {
  const { users, loading, fetch, block, activate, remove, assignRole, removeRole } = useAdminUserStore();
  const currentUser = useAuthStore(state => state.user);
  const isRoot = currentUser?.role === "ROOT";
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

  const handleRoleChange = async (id: number, role: string) => {
    try {
      if (role === "") await removeRole(id);
      else await assignRole(id, role);
      fetch(page);
    } catch (err: any) {
      console.error("Phân quyền lỗi:", err?.response?.status, err?.response?.data);
      alert("Phân quyền thất bại");
    }
  };

  // ROOT được đụng ADMIN, không ai được đụng ROOT
  const isDisabled = (targetRole: string) => {
    if (targetRole === "ROOT") return true;
    if (targetRole === "ADMIN" && !isRoot) return true;
    return false;
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
                  <select
                    value={u.role ?? ""}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className={styles.roleSelect}
                    disabled={isDisabled(u.role)}
                  >
                    <option value="">-- Không có --</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
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
                      disabled={isDisabled(u.role)}
                      style={{ opacity: isDisabled(u.role) ? 0.4 : 1 }}
                    >
                      {u.enabled ? "🔒 Khóa" : "✅ Mở"}
                    </button>
                    <button
                      className={styles.btnDel}
                      onClick={() => handleDelete(u.id, u.fullName || u.username)}
                      disabled={isDisabled(u.role)}
                      style={{ opacity: isDisabled(u.role) ? 0.4 : 1 }}
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