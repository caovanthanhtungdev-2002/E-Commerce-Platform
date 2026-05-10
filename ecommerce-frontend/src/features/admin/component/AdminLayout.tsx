import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import styles from "./AdminLayout.module.css";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/products", label: "Sản phẩm", icon: "📦" },
  { to: "/admin/categories", label: "Danh mục", icon: "🗂️" },
  { to: "/admin/orders", label: "Đơn hàng", icon: "🧾" },
  { to: "/admin/users", label: "Người dùng", icon: "👥" },
  { to: "/admin/coupons", label: "Coupon", icon: "🎟️" },
  { to: "/admin/inventory", label: "Kho hàng", icon: "🏭" },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={styles.layout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⚡</span>
          <span className={styles.brandName}>Admin Panel</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
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

      {/* MAIN */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
