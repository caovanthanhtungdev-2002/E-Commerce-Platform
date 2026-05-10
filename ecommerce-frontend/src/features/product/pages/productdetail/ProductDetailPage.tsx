import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { productService } from "@/features/product/services/productService";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import { getImageSrc } from "@/utils/getImage";
import { useToast } from "@/components/Toast";
import type { Product } from "@/features/product/types/productTypes";
import styles from "./ProductDetailPage.module.css";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);

  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  useEffect(() => {
    if (id) {
      setLoading(true);
      productService.getById(Number(id))
        .then((data) => { setProduct(data); setLoading(false); })
        .catch(() => { setLoading(false); });
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    // ✅ Shopee logic: chưa login → redirect về login, sau đó quay lại trang này
    if (!user) {
      navigate(`/login?next=${location.pathname}`);
      return;
    }

    setAddingCart(true);
    try {
      await addToCart(product.id, quantity);
      showToast(`Đã thêm "${product.name}" vào giỏ hàng! 🛒`, "success");
    } catch {
      showToast("Thêm vào giỏ hàng thất bại", "error");
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    // ✅ Shopee logic: chưa login → redirect về login, sau đó quay lại trang này
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
        },
      },
    });
  };

  if (loading) return (
    <div className={styles.loadingWrap}>
      <div className={styles.spinner}></div>
      <p>Đang tải sản phẩm...</p>
    </div>
  );

  if (!product) return (
    <div className={styles.notFound}>
      <div className={styles.notFoundIcon}>😕</div>
      <h2>Không tìm thấy sản phẩm</h2>
      <Link to="/products" className={styles.backBtn}>← Quay lại danh sách</Link>
    </div>
  );

  const discountedPrice = Math.floor(product.price * 0.92);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* BREADCRUMB */}
        <div className={styles.breadcrumb}>
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/products">Sản phẩm</Link>
          {product.categoryName && (
            <>
              <span>/</span>
              <Link to={`/products?categoryName=${encodeURIComponent(product.categoryName)}`}>{product.categoryName}</Link>
            </>
          )}
          <span>/</span>
          <span>{product.name}</span>
        </div>

        {/* MAIN DETAIL */}
        <div className={styles.detail}>
          {/* LEFT - IMAGE */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <img
                src={getImageSrc(product.imageUrl)}
                alt={product.name}
                onError={(e) => { e.currentTarget.src = "https://placehold.co/500x500/f5f5f5/999?text=SP"; }}
              />
            </div>
            {/* BADGES */}
            <div className={styles.badges}>
              <div className={styles.badge} style={{ background: "#fff5f5", color: "#d70018", borderColor: "#ffcccc" }}>
                🔄 1 đổi 1 trong 30 ngày
              </div>
              <div className={styles.badge} style={{ background: "#f0fff4", color: "#16a34a", borderColor: "#bbf7d0" }}>
                🛡️ Bảo hành 12 tháng
              </div>
              <div className={styles.badge} style={{ background: "#fff7ed", color: "#d97706", borderColor: "#fed7aa" }}>
                🚚 Giao hàng miễn phí
              </div>
            </div>
          </div>

          {/* RIGHT - INFO */}
          <div className={styles.infoSection}>
            {product.categoryName && (
              <span className={styles.categoryTag}>{product.categoryName}</span>
            )}
            <h1 className={styles.productName}>{product.name}</h1>

            {/* RATING */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[1,2,3,4,5].map((s) => (
                  <span key={s} style={{ color: s <= Math.round(product.avgRating || 0) ? "#f59e0b" : "#ddd" }}>★</span>
                ))}
              </div>
              <span className={styles.ratingNum}>{product.avgRating?.toFixed(1) || "Chưa có"}</span>
              {product.reviewCount ? <span className={styles.reviewCount}>({product.reviewCount} đánh giá)</span> : null}
            </div>

            {/* PRICE */}
            <div className={styles.priceBox}>
              <div className={styles.currentPrice}>{formatCurrencyVND(product.price)}</div>
              <div className={styles.oldPrice}>{formatCurrencyVND(Math.floor(product.price * 1.08))}</div>
              <div className={styles.discountBadge}>-8%</div>
            </div>

            <div className={styles.installment}>
              💳 Trả góp từ <strong>{formatCurrencyVND(Math.floor(product.price / 12))}/tháng</strong> — 0% lãi suất
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <div className={styles.descBox}>
                <h3>Mô tả sản phẩm</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* QUANTITY */}
            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Số lượng:</span>
              <div className={styles.qtyControl}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >−</button>
                <span className={styles.qtyNum}>{quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => q + 1)}
                >+</button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className={styles.actions}>
              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={addingCart}
              >
                ⚡ Mua ngay
              </button>
              <button
                className={`${styles.addCartBtn} ${addingCart ? styles.adding : ""}`}
                onClick={handleAddToCart}
                disabled={addingCart}
              >
                {addingCart ? "Đang thêm..." : "🛒 Thêm vào giỏ"}
              </button>
            </div>

            <div className={styles.totalPreview}>
              Tổng: <strong>{formatCurrencyVND(product.price * quantity)}</strong>
            </div>

            {/* POLICIES */}
            <div className={styles.policies}>
              {[
                { icon: "✅", text: "Hàng chính hãng 100%" },
                { icon: "🔄", text: "Đổi trả trong 30 ngày nếu lỗi NSX" },
                { icon: "🛡️", text: "Bảo hành tại nhà 1 đổi 1 năm đầu" },
                { icon: "💳", text: "Thanh toán linh hoạt, trả góp 0%" },
              ].map((p, i) => (
                <div key={i} className={styles.policyItem}>
                  <span>{p.icon}</span>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
                      