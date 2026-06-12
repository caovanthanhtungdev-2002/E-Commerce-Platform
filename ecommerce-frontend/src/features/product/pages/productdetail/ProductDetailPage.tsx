import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { productService } from "@/features/product/services/productService";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import { getImageSrc } from "@/utils/getImage";
import { useToast } from "@/components/Toast";
import type { Product } from "@/features/product/types/productTypes";
import ReviewPage from "@/features/review/pages/ReviewPage";
import styles from "./ProductDetailPage.module.css";

const DEFAULT_COLORS = [
  { label: "Đen", hex: "#1a1a1a" },
  { label: "Trắng", hex: "#f0f0f0" },
  { label: "Xanh Navy", hex: "#1e3a5f" },
  { label: "Đỏ", hex: "#cc2200" },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "spec">("desc");
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  useEffect(() => {
    if (id) {
      setLoading(true);
      productService
        .getById(Number(id))
        .then((data) => {
          setProduct(data);
          const colors = data.colors?.length ? data.colors : DEFAULT_COLORS;
          setSelectedColor(colors[0]?.label ?? null);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      navigate(`/login?next=${location.pathname}`);
      return;
    }
    setAddingCart(true);
    try {
      await addToCart(product.id, quantity);
      showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, "success");
    } catch {
      showToast("Thêm vào giỏ hàng thất bại", "error");
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!user) {
      navigate(`/login?next=${location.pathname}`);
      return;
    }
    navigate("/checkout", {
      state: {
        buyNowItem: {
          productId: product.id,
          productName: product.name,
          imageUrl: product.imageUrl,
          quantity,
          price: product.price,
          color: selectedColor,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundIcon}>😕</div>
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/products" className={styles.backBtn}>
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  
  const originalPrice = Math.floor(product.price * 1.08);
  const fullStars = Math.round(product.avgRating || 0);
  const colorOptions =
    product.colors && product.colors.length > 0
      ? product.colors
      : DEFAULT_COLORS;
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [product.imageUrl];

  return (
    <div className={styles.pageWrapper}>
      {/* BREADCRUMB */}
      <div className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbInner}>
          <Link to="/" className={styles.bcLink}>
            Trang chủ
          </Link>
          <span className={styles.bcSep}>›</span>
          <Link to="/products" className={styles.bcLink}>
            Sản phẩm
          </Link>
          {product.categoryName && (
            <>
              <span className={styles.bcSep}>›</span>
              <Link
                to={`/products?categoryName=${encodeURIComponent(product.categoryName)}`}
                className={styles.bcLink}
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <span className={styles.bcSep}>›</span>
          <span className={styles.bcCurrent}>{product.name}</span>
        </div>
      </div>

      <div className={styles.container}>
        {/* TOP CARD */}
        <div className={styles.topCard}>
          {/* LEFT — IMAGE */}
          <div className={styles.imageCol}>
            <div className={styles.mainImageWrap}>
              <img
                src={getImageSrc(gallery[activeImg])}
                alt={product.name}
                className={styles.mainImage}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/500x500/f5f5f5/999?text=SP";
                }}
              />
              <div className={styles.discountRibbon}>-8%</div>
            </div>

            {/* thumbnail strip */}
            <div className={styles.thumbStrip}>
              {gallery.map((url, i) => (
                <div
                  key={i}
                  className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img
                    src={getImageSrc(url)}
                    alt={`Ảnh ${i + 1}`}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/80x80/f5f5f5/999?text=SP";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — INFO */}
          <div className={styles.infoCol}>
            {product.categoryName && (
              <span className={styles.categoryTag}>{product.categoryName}</span>
            )}

            <h1 className={styles.productName}>{product.name}</h1>

            {/* rating + sold */}
            <div className={styles.ratingRow}>
              <span className={styles.ratingNum}>
                {product.avgRating?.toFixed(1) || "—"}
              </span>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={
                      s <= fullStars ? styles.starFilled : styles.starEmpty
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              {product.reviewCount ? (
                <a href="#review-section" className={styles.reviewLink}>
                  {product.reviewCount} Đánh Giá
                </a>
              ) : (
                <a href="#review-section" className={styles.reviewLink}>
                  Chưa có đánh giá
                </a>
              )}
              <span className={styles.dot}>|</span>
              <span className={styles.soldCount}>Đã Bán 1.2k</span>
            </div>

            {/* price box */}
            <div className={styles.priceBox}>
              <span className={styles.oldPrice}>
                {formatCurrencyVND(originalPrice)}
              </span>
              <span className={styles.currentPrice}>
                {formatCurrencyVND(product.price)}
              </span>
              <span className={styles.saveBadge}>Tiết kiệm 8%</span>
            </div>

            {/* shipping */}
            <div className={styles.shippingRow}>
              <span className={styles.shippingLabel}>Vận Chuyển</span>
              <div className={styles.shippingInfo}>
                <span className={styles.freeship}></span>
                <span className={styles.shippingNote}>
                  Nhận hàng trong 2–4 ngày
                </span>
              </div>
            </div>

            {/* COLOR SELECTOR */}
            <div className={styles.colorRow}>
              <span className={styles.colorLabel}>Màu Sắc</span>
              <div className={styles.colorOptions}>
                {colorOptions.map((c) => (
                  <button
                    key={c.label}
                    className={`${styles.colorOption} ${
                      selectedColor === c.label ? styles.colorOptionActive : ""
                    }`}
                    onClick={() => setSelectedColor(c.label)}
                    title={c.label}
                  >
                    <span
                      className={styles.colorSwatch}
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className={styles.colorName}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* quantity */}
            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Số Lượng</span>
              <div className={styles.qtyControl}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  className={styles.qtyInput}
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v >= 1) setQuantity(v);
                  }}
                />
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* action buttons */}
            <div className={styles.actions}>
              <button
                className={styles.addCartBtn}
                onClick={handleAddToCart}
                disabled={addingCart}
              >
                🛒 {addingCart ? "Đang thêm..." : "Thêm Vào Giỏ Hàng"}
              </button>
              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={addingCart}
              >
                Mua Ngay
              </button>
            </div>

            {/* policies */}
            <div className={styles.policiesRow}>
              {[
                { icon: "🛡️", text: "Hàng chính hãng 100%" },
                { icon: "🔄", text: "Đổi trả 30 ngày" },
                { icon: "💳", text: "Trả góp 0%" },
                { icon: "🎁", text: "Quà tặng hấp dẫn" },
              ].map((p, i) => (
                <div key={i} className={styles.policyItem}>
                  <span className={styles.policyIcon}>{p.icon}</span>
                  <span className={styles.policyText}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM CARD: tabs */}
        <div className={styles.bottomCard}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "desc" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("desc")}
            >
              Mô Tả Sản Phẩm
            </button>
            <button
              className={`${styles.tab} ${activeTab === "spec" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("spec")}
            >
              Thông Số Kỹ Thuật
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === "desc" ? (
              <div className={styles.descText}>
                {product.description ||
                  "Chưa có mô tả chi tiết cho sản phẩm này."}
              </div>
            ) : (
              <table className={styles.specTable}>
                <tbody>
                  {[
                    ["Danh mục", product.categoryName || "—"],
                    ["Mã sản phẩm", `#${product.id}`],
                    [
                      "Màu sắc",
                      colorOptions.map((c) => c.label).join(", ") || "—",
                    ],
                    ["Trạng thái", "Còn hàng"],
                    ["Xuất xứ", "Việt Nam"],
                    ["Bảo hành", "12 tháng"],
                  ].map(([label, value]) => (
                    <tr key={label} className={styles.specRow}>
                      <td className={styles.specLabel}>{label}</td>
                      <td className={styles.specValue}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* REVIEW SECTION */}
        <div className={styles.reviewCard}>
          <ReviewPage
            productId={product.id}
            productName={product.name}
            isLoggedIn={!!user}
          />
        </div>
      </div>
    </div>
  );
}