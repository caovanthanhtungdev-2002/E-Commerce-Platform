import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useProductStore } from "@/features/product/store/productStore";
import { useCategoryStore } from "@/features/category/store/categoryStore";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import { getImageSrc } from "@/utils/getImage";
import { useToast } from "@/components/Toast";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, fetchProducts } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [flashIndex, setFlashIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 30, s: 0 });
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts(0);
    fetchCategories(0);
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 2, m: 30, s: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = async (e: React.MouseEvent, productId: number, productName: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate(`/login?next=${location.pathname}`);
      return;
    }

    setAddingId(productId);
    try {
      await addToCart(productId, 1);
      showToast(`Đã thêm "${productName}" vào giỏ hàng! 🛒`, "success");
    } catch {
      showToast("Thêm vào giỏ hàng thất bại", "error");
    } finally {
      setAddingId(null);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate(`/login?next=${location.pathname}`);
      return;
    }

    navigate("/checkout", {
      state: {
        buyNowItem: {
          productId,
          quantity: 1,
        },
      },
    });
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  const bannerSlides = [
    { bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", title: "📱 iPhone 16 Series", sub: "Mới nhất - Đặt hàng ngay", cta: "Khám phá ngay" },
    { bg: "linear-gradient(135deg, #d70018 0%, #a0001a 50%, #700012 100%)", title: "🔥 Flash Sale Hôm Nay", sub: "Giảm đến 50% - Số lượng có hạn", cta: "Mua ngay" },
    { bg: "linear-gradient(135deg, #1d6348 0%, #0d4d37 50%, #083828 100%)", title: "💻 Laptop Gaming", sub: "Cấu hình khủng - Giá cực tốt", cta: "Xem ngay" },
  ];

  // ← FIX: Map icon theo tên category thay vì index
  const iconMap: Record<string, string> = {
    "Laptop": "💻",
    "Điện thoại": "📱",
    "Máy tính bảng": "📟",
    "Tai nghe": "🎧",
    "Phụ kiện": "🔌",
    "Bàn phím": "⌨️",
    "Chuột": "🖱️",
    "Màn hình": "🖥️",
  };

  const flashSaleProducts = products.slice(0, 6);
  const newProducts = products.slice(0, 8);

  return (
    <div className={styles.page}>
      {/* HERO BANNER */}
      <section className={styles.bannerSection}>
        <div className={styles.bannerMain}>
          <div
            className={styles.bannerSlide}
            style={{ background: bannerSlides[flashIndex].bg }}
          >
            <div className={styles.bannerContent}>
              <h1 className={styles.bannerTitle}>{bannerSlides[flashIndex].title}</h1>
              <p className={styles.bannerSub}>{bannerSlides[flashIndex].sub}</p>
              <button className={styles.bannerCta} onClick={() => navigate("/products")}>
                {bannerSlides[flashIndex].cta} →
              </button>
            </div>
            <div className={styles.bannerImage}>
              <div className={styles.bannerPhone}>📱</div>
            </div>
          </div>
          <div className={styles.bannerDots}>
            {bannerSlides.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === flashIndex ? styles.dotActive : ""}`}
                onClick={() => setFlashIndex(i)}
              />
            ))}
          </div>
        </div>

        {/* PROMO BADGES */}
        <div className={styles.bannerSide}>
          <div className={styles.promoBadge} style={{ background: "linear-gradient(135deg,#ff6b35,#f7931e)" }}>
            <div className={styles.promoIcon}>🔄</div>
            <div>
              <div className={styles.promoTitle}>Thu cũ</div>
              <div className={styles.promoSub}>Đổi mới - Lên đời</div>
            </div>
          </div>
          <div className={styles.promoBadge} style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
            <div className={styles.promoIcon}>🛡️</div>
            <div>
              <div className={styles.promoTitle}>Bảo hành</div>
              <div className={styles.promoSub}>12 tháng tại nhà</div>
            </div>
          </div>
          <div className={styles.promoBadge} style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)" }}>
            <div className={styles.promoIcon}>🚚</div>
            <div>
              <div className={styles.promoTitle}>Giao hàng</div>
              <div className={styles.promoSub}>Miễn phí toàn quốc</div>
            </div>
          </div>
          <div className={styles.promoBadge} style={{ background: "linear-gradient(135deg,#fc5c7d,#6a3093)" }}>
            <div className={styles.promoIcon}>💳</div>
            <div>
              <div className={styles.promoTitle}>Trả góp 0%</div>
              <div className={styles.promoSub}>Trả trước 0đ</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY QUICK ACCESS */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.categoryGrid}>
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}
                className={styles.categoryItem}
              >
                {/* ← FIX: dùng iconMap thay vì icons[i] */}
                <div className={styles.catIcon}>{iconMap[cat.name] ?? "📦"}</div>
                <span className={styles.catName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FLASH SALE */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.flashSaleHeader}>
            <div className={styles.flashTitle}>
              <span className={styles.flashIcon}>⚡</span>
              <span>FLASH SALE</span>
            </div>
            <div className={styles.countdown}>
              <span className={styles.countdownLabel}>Kết thúc sau:</span>
              <div className={styles.countdownBox}>{pad(timeLeft.h)}</div>
              <span className={styles.countdownColon}>:</span>
              <div className={styles.countdownBox}>{pad(timeLeft.m)}</div>
              <span className={styles.countdownColon}>:</span>
              <div className={styles.countdownBox}>{pad(timeLeft.s)}</div>
            </div>
            <Link to="/products" className={styles.seeAll}>Xem tất cả →</Link>
          </div>

          <div className={styles.productRow}>
            {flashSaleProducts.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className={styles.productCard}>
                <div className={styles.flashBadge}>-{Math.floor(Math.random() * 20 + 5)}%</div>
                <div className={styles.productImageWrap}>
                  <img
                    src={getImageSrc(p.imageUrl)}
                    alt={p.name}
                    className={styles.productImage}
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/200x200/f5f5f5/999?text=SP"; }}
                  />
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{p.name}</h3>
                  <div className={styles.productPriceWrap}>
                    <span className={styles.productPrice}>{formatCurrencyVND(p.price)}</span>
                    <span className={styles.productOldPrice}>{formatCurrencyVND(Math.floor(p.price * 1.1))}</span>
                  </div>
                  {p.avgRating && p.avgRating > 0 ? (
                    <div className={styles.rating}>
                      {"⭐".repeat(Math.round(p.avgRating))} <span>({p.reviewCount})</span>
                    </div>
                  ) : null}
                  <button
                    className={`${styles.addCartBtn} ${addingId === p.id ? styles.adding : ""}`}
                    onClick={(e) => handleAddToCart(e, p.id, p.name)}
                    disabled={addingId === p.id}
                  >
                    {addingId === p.id ? "Đang thêm..." : "🛒 Thêm giỏ"}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleAccent}>🆕</span> Sản phẩm mới
            </h2>
            <Link to="/products" className={styles.seeAll}>Xem tất cả →</Link>
          </div>

          <div className={styles.productGrid}>
            {newProducts.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className={styles.productCard}>
                <div className={styles.productImageWrap}>
                  <img
                    src={getImageSrc(p.imageUrl)}
                    alt={p.name}
                    className={styles.productImage}
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/200x200/f5f5f5/999?text=SP"; }}
                  />
                </div>
                <div className={styles.productInfo}>
                  <p className={styles.productCat}>{p.categoryName}</p>
                  <h3 className={styles.productName}>{p.name}</h3>
                  <div className={styles.productPriceWrap}>
                    <span className={styles.productPrice}>{formatCurrencyVND(p.price)}</span>
                  </div>
                  <button
                    className={`${styles.addCartBtn} ${addingId === p.id ? styles.adding : ""}`}
                    onClick={(e) => handleAddToCart(e, p.id, p.name)}
                    disabled={addingId === p.id}
                  >
                    {addingId === p.id ? "Đang thêm..." : "🛒 Thêm giỏ"}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className={styles.trustSection}>
        <div className={styles.sectionInner}>
          <div className={styles.trustGrid}>
            {[
              { icon: "🏆", title: "Hàng Chính Hãng 100%", sub: "Cam kết nguyên seal" },
              { icon: "🔄", title: "1 Đổi 1 trong 30 ngày", sub: "Nếu có lỗi từ NSX" },
              { icon: "🚚", title: "Giao hàng toàn quốc", sub: "Miễn phí đơn từ 500k" },
              { icon: "💳", title: "Trả góp 0% lãi suất", sub: "Qua thẻ tín dụng" },
              { icon: "🛠️", title: "Bảo hành chính hãng", sub: "12-24 tháng tại nhà" },
            ].map((item, i) => (
              <div key={i} className={styles.trustItem}>
                <div className={styles.trustIcon}>{item.icon}</div>
                <div>
                  <div className={styles.trustTitle}>{item.title}</div>
                  <div className={styles.trustSub}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
