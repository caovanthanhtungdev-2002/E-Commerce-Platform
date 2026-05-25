import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { adminDashboardService } from "../services/adminOtherServices";
import styles from "./AdminLayout.module.css";

const POLL_INTERVAL = 30_000;
const STORAGE_KEY = "admin_last_seen_pending_count";

function usePendingOrders() {
  const [pendingCount, setPendingCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = async () => {
    try {
      const stats = await adminDashboardService.getOrderStatusStats();
      const entry = stats.find(([s]) => s === "PENDING");
      const current = entry ? Number(entry[1]) : 0;
      setPendingCount(current);

      const lastSeen = Number(localStorage.getItem(STORAGE_KEY) ?? current);
      setNewCount(Math.max(0, current - lastSeen));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchStats();
    intervalRef.current = setInterval(fetchStats, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const markSeen = () => {
    localStorage.setItem(STORAGE_KEY, String(pendingCount));
    setNewCount(0);
  };

  return { pendingCount, newCount, markSeen };
}

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pendingCount, newCount, markSeen } = usePendingOrders();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navItem} ${isActive ? styles.active : ""}`;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⚡</span>
          <span className={styles.brandName}>Admin Panel</span>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/admin" end className={navClass}>
            <span className={styles.navIcon}>📊</span>
            <span className={styles.navLabel}>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/products" className={navClass}>
            <span className={styles.navIcon}>📦</span>
            <span className={styles.navLabel}>Sản phẩm</span>
          </NavLink>

          <NavLink to="/admin/categories" className={navClass}>
            <span className={styles.navIcon}>🗂️</span>
            <span className={styles.navLabel}>Danh mục</span>
          </NavLink>

          <NavLink to="/admin/orders" className={navClass} onClick={markSeen}>
            <span className={styles.navIcon}>🧾</span>
            <span className={styles.navLabel}>Đơn hàng</span>
            {pendingCount > 0 && (
              <span className={`${styles.badge} ${newCount > 0 ? styles.badgeNew : ""}`}>
                {pendingCount}
              </span>
            )}
          </NavLink>

          <NavLink to="/admin/users" className={navClass}>
            <span className={styles.navIcon}>👥</span>
            <span className={styles.navLabel}>Người dùng</span>
          </NavLink>

          <NavLink to="/admin/coupons" className={navClass}>
            <span className={styles.navIcon}>🎟️</span>
            <span className={styles.navLabel}>Coupon</span>
          </NavLink>

          <NavLink to="/admin/inventory" className={navClass}>
            <span className={styles.navIcon}>🏭</span>
            <span className={styles.navLabel}>Kho hàng</span>
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {(user?.fullName || user?.username || "A")[0].toUpperCase()}
            </div>
            <div>
              <div className={styles.userName}>
                {user?.fullName || user?.username}
              </div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}