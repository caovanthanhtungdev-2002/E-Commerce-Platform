import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import { getImageSrc } from "@/utils/getImage";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, fetchCart, loading, removeFromCart, toggleSelect, updateQuantity, clearCart } = useCartStore();

  useEffect(() => { fetchCart(); }, []);

  const selectedItems = items.filter((i) => i.selected);
  const total = selectedItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const allSelected = items.length > 0 && items.every((i) => i.selected);

  const toggleAll = () => {
    const store = useCartStore.getState();
    items.forEach((item) => {
      if (allSelected || !item.selected) store.toggleSelect(item.productId);
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            🛒 Giỏ hàng của bạn
            <span className={styles.count}>{items.length} sản phẩm</span>
          </h1>
          <Link to="/products" className={styles.continueShop}>← Tiếp tục mua sắm</Link>
        </div>

        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner}></div>
            <p>Đang tải giỏ hàng...</p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2>Giỏ hàng trống</h2>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link to="/products" className={styles.shopBtn}>Mua sắm ngay →</Link>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* CART ITEMS */}
            <div className={styles.itemsSection}>
              {/* SELECT ALL */}
              <div className={styles.selectAllBar}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className={styles.checkbox}
                  />
                  Chọn tất cả ({items.length} sản phẩm)
                </label>
                {selectedItems.length > 0 && (
  <button
    className={styles.deleteSelected}
    onClick={async () => {
      for (const i of selectedItems) {
        await removeFromCart(i.productId);
      }
    }}
  >
    🗑 Xóa đã chọn
  </button>
)}
              </div>

              {/* ITEMS */}
              {items.map((item) => (
                <div key={item.productId} className={`${styles.itemCard} ${!item.selected ? styles.itemDimmed : ""}`}>
                  <label className={styles.itemCheck}>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelect(item.productId)}
                      className={styles.checkbox}
                    />
                  </label>

                  <Link to={`/products/${item.productId}`} className={styles.itemImageWrap}>
                    <img
                      src={getImageSrc(item.imageUrl)}
                      alt={item.productName}
                      className={styles.itemImage}
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100/f5f5f5/999?text=SP"; }}
                    />
                  </Link>

                  <div className={styles.itemInfo}>
                    <Link to={`/products/${item.productId}`} className={styles.itemName}>
                      {item.productName}
                    </Link>
                    <div className={styles.itemPrice}>{formatCurrencyVND(Number(item.price))}</div>
                  </div>

                  <div className={styles.itemQty}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >−</button>
                    <span className={styles.qtyNum}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >+</button>
                  </div>

                  <div className={styles.itemSubtotal}>
                    <div className={styles.subtotalPrice}>{formatCurrencyVND(Number(item.price) * item.quantity)}</div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.productId)}
                    >✕ Xóa</button>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className={styles.summary}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Tóm tắt đơn hàng</h3>

                <div className={styles.summaryRow}>
                  <span>Sản phẩm đã chọn</span>
                  <span>{selectedItems.length}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tạm tính</span>
                  <span>{formatCurrencyVND(total)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Phí vận chuyển</span>
                  <span className={styles.free}>Miễn phí</span>
                </div>
                <div className={styles.summaryDivider}></div>
                <div className={styles.summaryTotal}>
                  <span>Tổng cộng</span>
                  <span className={styles.totalPrice}>{formatCurrencyVND(total)}</span>
                </div>

                <button
                  className={styles.checkoutBtn}
                  disabled={selectedItems.length === 0}
                  onClick={() => navigate("/checkout")}
                >
                  Tiến hành thanh toán ({selectedItems.length})
                </button>

                {selectedItems.length === 0 && (
                  <p className={styles.noSelectMsg}>Vui lòng chọn ít nhất 1 sản phẩm</p>
                )}

                <div className={styles.summaryBadges}>
                  <div className={styles.summaryBadge}>🔒 Thanh toán bảo mật</div>
                  <div className={styles.summaryBadge}>🚚 Giao hàng miễn phí</div>
                  <div className={styles.summaryBadge}>🔄 Đổi trả 30 ngày</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
