import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useCategoryStore } from "@/features/category/store/categoryStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import styles from "./MainLayout.module.css";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { items, fetchCart } = useCartStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { user, logout } = useAuthStore();

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // ✅ Categories: public, luôn load dù chưa đăng nhập
  useEffect(() => {
    fetchCategories(0);
  }, []);

  // ✅ Cart: chỉ fetch khi đã đăng nhập
  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");  // ✅ Shopee logic: logout → về trang chủ, không về login
  };

  return (
    <div className={styles.layout}>
      {/* TOP PROMO BAR */}
      <div className={styles.promoBar}>
        <span>🔥 Flash Sale mỗi ngày - Giảm đến <strong>50%++</strong> | Miễn phí giao hàng đơn từ 500k</span>
      </div>

      {/* MAIN HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* LOGO */}
          <Link to="/" className={styles.logo}>
            <img src="/logo.png" alt="TheGioiDiDong" onError={(e) => {
              e.currentTarget.style.display = "none";
              (e.currentTarget.nextSibling as HTMLElement).style.display = "block";
            }} />
            <span style={{ display: "none" }} className={styles.logoText}>TGBNY</span>
          </Link>

          {/* SEARCH */}
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <input
              className={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>

          {/* ACTIONS */}
          <div className={styles.actions}>
            {/* USER */}
            <div className={styles.actionItem} ref={userMenuRef}>
              <button className={styles.actionBtn} onClick={() => setShowUserMenu(!showUserMenu)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span>
                  {user
                    ? (user.fullName || user.username || user.email)?.split(" ").pop()
                    : "Đăng nhập"}
                </span>
              </button>

              {showUserMenu && (
                <div className={styles.userMenu}>
                  {user ? (
                    <>
                      <Link to="/profile" className={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                        👤 Tài khoản của tôi
                      </Link>
                      <Link to="/orders" className={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                        📦 Lịch sử đơn hàng
                      </Link>
                      <button className={styles.menuItemDanger} onClick={handleLogout}>
                        🚪 Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                        🔑 Đăng nhập
                      </Link>
                      <Link to="/register" className={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                        📝 Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* CART */}
            <Link to="/cart" className={styles.cartBtn}>
              <div className={styles.cartIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {cartCount > 0 && (
                  <span className={styles.cartBadge}>{cartCount > 99 ? "99+" : cartCount}</span>
                )}
              </div>
              <span>Giỏ hàng</span>
            </Link>
          </div>
        </div>

        {/* CATEGORY NAV */}
        <nav className={styles.categoryNav}>
          <div className={styles.categoryNavInner}>
            <Link
              to="/products"
              className={`${styles.navItem} ${
                location.pathname === "/products" && !searchParams.get("categoryId")
                  ? styles.navItemActive
                  : ""
              }`}
            >
              Tất cả sản phẩm
            </Link>
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}
                className={`${styles.navItem} ${
                  new URLSearchParams(location.search).get("categoryId") === String(cat.id)
                    ? styles.navItemActive
                    : ""
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        {children}
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerCol}>
            <h4>Về chúng tôi</h4>
            <p>Hệ thống bán lẻ điện thoại & phụ kiện uy tín hàng đầu Việt Nam.</p>
          </div>
          <div className={styles.footerCol}>
            <h4>Chính sách</h4>
            <a href="#">Chính sách bảo hành</a>
            <a href="#">Chính sách đổi trả</a>
            <a href="#">Chính sách giao hàng</a>
          </div>
          <div className={styles.footerCol}>
            <h4>Hỗ trợ</h4>
            <a href="#">Hotline: 1800 2097</a>
            <a href="#">Email: cskh@tgdd.vn</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          © 2025 Thế Giới Di Động. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
