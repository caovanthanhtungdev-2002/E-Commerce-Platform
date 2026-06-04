import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useCategoryStore } from "@/features/category/store/categoryStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useNotificationStore } from "@/features/notification/store/notificationStore";
import styles from "./MainLayout.module.css";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [hoveredCatId, setHoveredCatId] = useState<number | null>(null);
  const [hoveredSubId, setHoveredSubId] = useState<number | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { items, fetchCart } = useCartStore();
  const { tree, fetchCategories, fetchTree } = useCategoryStore();
  const { user, logout } = useAuthStore();
  console.log("[DEBUG] auth user shape:", JSON.stringify(user));

  // ← bỏ addNotification
  const { notifications, markAllRead, clearAll } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    fetchCategories(0);
    fetchTree();
  }, []);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ← useWebSocket chỉ cần onCartUpdate, hook tự lo notification + toast
  useWebSocket({
    onOrderUpdate: () => {},
    onCartUpdate: () => fetchCart(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleNavMouseEnter = (catId: number) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveredCatId(catId);
    setHoveredSubId(null);
  };

  const handleNavMouseLeave = () => {
    hoverTimer.current = setTimeout(() => {
      setHoveredCatId(null);
      setHoveredSubId(null);
    }, 150);
  };

  const handleMegaMouseEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  const handleMegaMouseLeave = () => {
    hoverTimer.current = setTimeout(() => {
      setHoveredCatId(null);
      setHoveredSubId(null);
    }, 150);
  };

  const handleSubMouseEnter = (subId: number) => {
    if (subHoverTimer.current) clearTimeout(subHoverTimer.current);
    setHoveredSubId(subId);
  };

  const handleSubMouseLeave = () => {
    subHoverTimer.current = setTimeout(() => setHoveredSubId(null), 100);
  };

  const handleLevel3PanelMouseEnter = () => {
    if (subHoverTimer.current) clearTimeout(subHoverTimer.current);
  };

  const handleLevel3PanelMouseLeave = () => {
    subHoverTimer.current = setTimeout(() => setHoveredSubId(null), 100);
  };

  const hoveredCat = tree.find((c) => c.id === hoveredCatId);
  const hoveredSub = hoveredCat?.children?.find((s) => s.id === hoveredSubId);

  return (
    <div className={styles.layout}>
      <div className={styles.promoBar}>
        <span>🔥 Flash Sale mỗi ngày - Giảm đến <strong>50%++</strong> | Miễn phí giao hàng đơn từ 500k</span>
      </div>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <img src="/logo.png" alt="TGBNY" onError={(e) => {
              e.currentTarget.style.display = "none";
              (e.currentTarget.nextSibling as HTMLElement).style.display = "block";
            }} />
            <span style={{ display: "none" }} className={styles.logoText}>TGBNY</span>
          </Link>

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

          <div className={styles.actions}>

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
                      <Link to="/profile" className={styles.menuItem} onClick={() => setShowUserMenu(false)}>👤 Tài khoản của tôi</Link>
                      <Link to="/orders" className={styles.menuItem} onClick={() => setShowUserMenu(false)}>📦 Lịch sử đơn hàng</Link>
                      <button className={styles.menuItemDanger} onClick={handleLogout}>🚪 Đăng xuất</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className={styles.menuItem} onClick={() => setShowUserMenu(false)}>🔑 Đăng nhập</Link>
                      <Link to="/register" className={styles.menuItem} onClick={() => setShowUserMenu(false)}>📝 Đăng ký</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {user && (
              <div className={styles.actionItem} ref={notifRef}>
                <button
                  className={styles.actionBtn}
                  onClick={() => {
                    setShowNotif(!showNotif);
                    if (!showNotif) markAllRead();
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && (
                      <span className={styles.cartBadge}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>Thông báo</span>
                </button>

                {showNotif && (
                  <div className={styles.notifDropdown}>
                    <div className={styles.notifHeader}>
                      <span>Thông báo</span>
                      {notifications.length > 0 && (
                        <button className={styles.notifClear} onClick={clearAll}>
                          Xoá tất cả
                        </button>
                      )}
                    </div>
                    <div className={styles.notifList}>
                      {notifications.length === 0 ? (
                        <div className={styles.notifEmpty}>Không có thông báo nào</div>
                      ) : (
                        notifications.map((n) => (
                          <a
                            key={n.id}
                            href={`/orders/${n.orderId}`}
                            className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ""}`}
                            onClick={() => setShowNotif(false)}
                          >
                            <div className={styles.notifMessage}>{n.message}</div>
                            <div className={styles.notifTime}>
                              {new Date(n.createdAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </a>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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

        <nav className={styles.categoryNav}>
          <div className={styles.categoryNavInner}>
            <Link
              to="/products"
              className={`${styles.navItem} ${
                location.pathname === "/products" && !searchParams.get("categoryId")
                  ? styles.navItemActive : ""
              }`}
            >
              Tất cả sản phẩm
            </Link>

            {tree.map((cat) => (
              <div
                key={cat.id}
                className={styles.navItemWrap}
                onMouseEnter={() => handleNavMouseEnter(cat.id)}
                onMouseLeave={handleNavMouseLeave}
              >
                <Link
                  to={`/products?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}
                  className={`${styles.navItem} ${
                    searchParams.get("categoryId") === String(cat.id) ? styles.navItemActive : ""
                  }`}
                >
                  {cat.name}
                  {cat.children && cat.children.length > 0 && (
                    <svg width="10" height="10" viewBox="0 0 10 10" style={{ marginLeft: 4 }}>
                      <path d="M2 3l3 4 3-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    </svg>
                  )}
                </Link>
              </div>
            ))}
          </div>

          {hoveredCat && hoveredCat.children && hoveredCat.children.length > 0 && (
            <div
              className={styles.megaMenu}
              onMouseEnter={handleMegaMouseEnter}
              onMouseLeave={handleMegaMouseLeave}
            >
              <div className={styles.megaMenuInner}>
                <div className={styles.megaHeader}>
                  <Link
                    to={`/products?categoryId=${hoveredCat.id}&categoryName=${encodeURIComponent(hoveredCat.name)}`}
                    className={styles.megaHeaderLink}
                    onClick={() => { setHoveredCatId(null); setHoveredSubId(null); }}
                  >
                    {hoveredCat.name}
                    <span className={styles.megaHeaderArrow}>Xem tất cả →</span>
                  </Link>
                </div>

                <div className={styles.megaBody}>
                  <div className={styles.megaSubList}>
                    {hoveredCat.children.map((sub) => {
                      const hasChildren = sub.children && sub.children.length > 0;
                      const isActive = hoveredSubId === sub.id;
                      return (
                        <div
                          key={sub.id}
                          className={`${styles.megaSubItem} ${isActive ? styles.megaSubItemActive : ""}`}
                          onMouseEnter={() => hasChildren ? handleSubMouseEnter(sub.id) : setHoveredSubId(null)}
                          onMouseLeave={hasChildren ? handleSubMouseLeave : undefined}
                        >
                          <Link
                            to={`/products?categoryId=${sub.id}&categoryName=${encodeURIComponent(sub.name)}`}
                            className={styles.megaSubLink}
                            onClick={() => { setHoveredCatId(null); setHoveredSubId(null); }}
                          >
                            <div className={styles.megaSubIcon}>
                              {sub.name.includes("Gaming") ? "🎮" :
                               sub.name.includes("Văn phòng") ? "💼" :
                               sub.name.includes("AI") ? "🤖" :
                               sub.name.includes("Hãng") ? "🏷️" :
                               sub.name.includes("Phụ kiện") ? "🔧" :
                               sub.name.includes("Điện thoại") ? "📱" :
                               sub.name.includes("Màn hình") ? "🖥️" :
                               sub.name.includes("Bàn phím") ? "⌨️" :
                               sub.name.includes("Chuột") ? "🖱️" :
                               sub.name.includes("Tai nghe") ? "🎧" : "📦"}
                            </div>
                            <div className={styles.megaSubText}>
                              <span className={styles.megaSubName}>{sub.name}</span>
                              {sub.description && (
                                <span className={styles.megaSubDesc}>{sub.description}</span>
                              )}
                            </div>
                            {hasChildren && (
                              <svg
                                className={styles.megaSubArrow}
                                width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2"
                              >
                                <path d="M9 18l6-6-6-6"/>
                              </svg>
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  {hoveredSub && hoveredSub.children && hoveredSub.children.length > 0 && (
                    <div
                      className={styles.megaLevel3Panel}
                      onMouseEnter={handleLevel3PanelMouseEnter}
                      onMouseLeave={handleLevel3PanelMouseLeave}
                    >
                      <div className={styles.megaLevel3Header}>
                        <Link
                          to={`/products?categoryId=${hoveredSub.id}&categoryName=${encodeURIComponent(hoveredSub.name)}`}
                          className={styles.megaLevel3HeaderLink}
                          onClick={() => { setHoveredCatId(null); setHoveredSubId(null); }}
                        >
                          {hoveredSub.name}
                          <span className={styles.megaLevel3HeaderArrow}>Xem tất cả →</span>
                        </Link>
                      </div>
                      <div className={styles.megaLevel3Grid}>
                        {hoveredSub.children.map((subSub) => (
                          <Link
                            key={subSub.id}
                            to={`/products?categoryId=${subSub.id}&categoryName=${encodeURIComponent(subSub.name)}`}
                            className={styles.megaLevel3Item}
                            onClick={() => { setHoveredCatId(null); setHoveredSubId(null); }}
                          >
                            <span className={styles.megaLevel3Name}>{subSub.name}</span>
                            {subSub.description && (
                              <span className={styles.megaLevel3Desc}>{subSub.description}</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerCol}>
            <h4>Về chúng tôi</h4>
            <p>Hệ thống thiết bị điện tử uy tín hàng đầu Việt Nam.</p>
          </div>
          <div className={styles.footerCol}>
            <h4>Chính sách</h4>
            <a href="#">Chính sách bảo hành</a>
            <a href="#">Chính sách đổi trả</a>
            <a href="#">Chính sách giao hàng</a>
          </div>
          <div className={styles.footerCol}>
            <h4>Hỗ trợ</h4>
            <a href="#">Hotline: 0932569302</a>
            <a href="#">Email: caovanthanhtung.dev@gmail.com</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          © 2026 Thế Giới Di Động. All rights reserved.
        </div>
      </footer>
    </div>
  );
}