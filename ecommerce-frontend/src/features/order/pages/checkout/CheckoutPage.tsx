import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useOrderStore } from "../../store/orderStore";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useUserStore } from "@/features/user/store/userStore";

import { formatCurrencyVND } from "@/utils/formatCurrency";
import { getImageSrc } from "@/utils/getImage";

import styles from "./CheckoutPage.module.css";

const SS_ITEMS   = "checkout_items";
const SS_PHONE   = "checkout_phone";
const SS_ADDRESS = "checkout_address";
const SS_COUPON  = "checkout_coupon";
const SS_METHOD  = "checkout_method";

export default function CheckoutPage() {

  const [phone, setPhone] = useState(
    () => sessionStorage.getItem(SS_PHONE) || ""
  );
  const [address, setAddress] = useState(
    () => sessionStorage.getItem(SS_ADDRESS) || ""
  );
  const [coupon, setCoupon] = useState(
    () => sessionStorage.getItem(SS_COUPON) || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">(
    () => (sessionStorage.getItem(SS_METHOD) as "COD" | "VNPAY") || "COD"
  );

  const [cartReady, setCartReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;

  const { create, loading } = useOrderStore();
  const { items, fetchCart } = useCartStore();
  const { user, fetchProfile } = useUserStore();

  useEffect(() => {
    // Xóa order cũ để tránh redirect nhầm
    useOrderStore.setState({ currentOrder: null });
    sessionStorage.removeItem(SS_ITEMS);
    fetchProfile();

    if (buyNowItem) {
      setCartReady(true);
      return;
    }

    // Kiểm tra state hiện tại trong store — không fetch lại để giữ tick
    const selected = useCartStore.getState().items.filter(i => i.selected);
    if (selected.length === 0) {
      // Không có item được chọn → về cart
      navigate("/cart", { replace: true });
      return;
    }

    setCartReady(true);
  }, []);

  useEffect(() => {
    if (user) {
      if (!sessionStorage.getItem(SS_PHONE)) setPhone(user.phone || "");
      if (!sessionStorage.getItem(SS_ADDRESS)) setAddress(user.address || "");
    }
  }, [user]);

  useEffect(() => { sessionStorage.setItem(SS_PHONE,   phone);         }, [phone]);
  useEffect(() => { sessionStorage.setItem(SS_ADDRESS, address);       }, [address]);
  useEffect(() => { sessionStorage.setItem(SS_COUPON,  coupon);        }, [coupon]);
  useEffect(() => { sessionStorage.setItem(SS_METHOD,  paymentMethod); }, [paymentMethod]);

  const liveCartItems = items.filter((item) => item.selected);

  const checkoutItems = buyNowItem
    ? [buyNowItem]
    : liveCartItems;

  const finalTotal = checkoutItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const isValid = phone.trim() !== "" && address.trim() !== "";

  const clearCheckoutSession = () => {
    [SS_ITEMS, SS_PHONE, SS_ADDRESS, SS_COUPON, SS_METHOD].forEach(
      (key) => sessionStorage.removeItem(key)
    );
  };

  const handleCheckout = async () => {
    if (!isValid) {
      alert("Vui lòng điền số điện thoại và địa chỉ nhận hàng.");
      return;
    }

    if (checkoutItems.length === 0) {
      alert("Không có sản phẩm nào được chọn.");
      return;
    }

    try {
      const selectedProductIds = checkoutItems.map((i: any) => i.productId);

      await create({
        couponCode: coupon.trim() || undefined,
        paymentMethod,
        receiverName: user?.fullName || "",
        phone: phone.trim(),
        address: address.trim(),
        selectedProductIds,
      });

      const order = useOrderStore.getState().currentOrder;
      if (!order) return;

      if (paymentMethod === "COD") {
        clearCheckoutSession();
        alert("Đặt hàng thành công!");
        navigate(`/orders/${order.id}`);
        return;
      }

      navigate(`/payment/${order.id}`);

    } catch (err: any) {
      alert(err?.response?.data?.message || "Đặt hàng thất bại");
    }
  };

  if (!cartReady) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px", flexDirection: "column", gap: "12px" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #eee", borderTop: "3px solid #e53935", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#888", fontSize: "14px" }}>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <div className={styles.breadcrumb}>
        <span>🛒 Giỏ hàng</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Thanh toán</span>
      </div>

      <div className={styles.container}>

        <div className={styles.left}>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionHeaderIcon}>📍</span>
              <span className={styles.sectionHeaderTitle}>Địa chỉ nhận hàng</span>
            </div>
            <div className={styles.shippingFields}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Số điện thoại</label>
                <input
                  className={styles.fieldInput}
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Địa chỉ</label>
                <input
                  className={styles.fieldInput}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionHeaderIcon}>🛍️</span>
              <span className={styles.sectionHeaderTitle}>
                Sản phẩm ({checkoutItems.length})
              </span>
            </div>

            <div className={styles.items}>
              {checkoutItems.length === 0 ? (
                <div style={{ padding: "20px", color: "#aaa", fontSize: "14px", textAlign: "center" }}>
                  Không có sản phẩm nào được chọn
                </div>
              ) : (
                checkoutItems.map((item: any) => (
                  <div key={item.productId} className={styles.item}>
                    <div className={styles.itemLeft}>
                      <img
                        src={getImageSrc(item.imageUrl)}
                        className={styles.image}
                        onError={(e) => {
                          e.currentTarget.src = "https://picsum.photos/72";
                        }}
                      />
                      <div className={styles.itemInfo}>
                        <h4>{item.productName}</h4>
                        <div className={styles.itemMeta}>
                          <span className={styles.itemQty}>x{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.itemRight}>
                      {formatCurrencyVND(item.price * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.shippingMethod}>
              <div className={styles.shippingMethodLeft}>
                <span>🚚</span>
                <span className={styles.shippingMethodLabel}>Vận chuyển nhanh</span>
                <span style={{ color: "#888", fontSize: "12px" }}>· Nhận hàng trong 2–3 ngày</span>
              </div>
              <span className={styles.shippingMethodFree}>Miễn phí</span>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.voucherRow}>
              <div className={styles.voucherLeft}>
                <span>🎟️</span>
                Mã giảm giá
              </div>
              <input
                className={styles.voucherInput}
                placeholder="Nhập mã giảm giá"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <button className={styles.voucherApply}>Áp dụng</button>
            </div>
          </div>

        </div>

        <div className={styles.right}>

          <div className={styles.summary}>
            <div className={styles.summaryHeader}>
              <h3>Tóm tắt đơn hàng</h3>
            </div>
            <div className={styles.summaryBody}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>
                  Tạm tính ({checkoutItems.length} sản phẩm)
                </span>
                <span className={styles.rowValue}>
                  {formatCurrencyVND(finalTotal)}
                </span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Phí vận chuyển</span>
                <span style={{ color: "#26aa99", fontWeight: 600, fontSize: "14px" }}>
                  Miễn phí
                </span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Giảm giá voucher</span>
                <span className={styles.rowValue}>{formatCurrencyVND(0)}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Tổng thanh toán</span>
                <span className={styles.totalValue}>
                  {formatCurrencyVND(finalTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.paymentCard}>
            <div className={styles.paymentHeader}>Phương thức thanh toán</div>
            <div className={styles.paymentMethods}>

              <label
                className={`${styles.paymentOption} ${paymentMethod === "COD" ? styles.selected : ""}`}
                onClick={() => setPaymentMethod("COD")}
              >
                <input
                  type="radio"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <span className={styles.paymentOptionIcon}>💵</span>
                <div>
                  <div className={styles.paymentOptionLabel}>Thanh toán khi nhận hàng</div>
                  <div className={styles.paymentOptionSub}>COD — Trả tiền mặt khi nhận</div>
                </div>
              </label>

              <label
                className={`${styles.paymentOption} ${paymentMethod === "VNPAY" ? styles.selected : ""}`}
                onClick={() => setPaymentMethod("VNPAY")}
              >
                <input
                  type="radio"
                  value="VNPAY"
                  checked={paymentMethod === "VNPAY"}
                  onChange={() => setPaymentMethod("VNPAY")}
                />
                <span className={styles.paymentOptionIcon}>🏦</span>
                <div>
                  <div className={styles.paymentOptionLabel}>VNPAY</div>
                  <div className={styles.paymentOptionSub}>Thanh toán qua cổng VNPAY</div>
                </div>
              </label>

            </div>
          </div>

          <button
            className={styles.placeOrderBtn}
            onClick={handleCheckout}
            disabled={loading || !isValid || checkoutItems.length === 0}
          >
            {loading
              ? "Đang xử lý..."
              : `Đặt hàng · ${formatCurrencyVND(finalTotal)}`}
          </button>

          <p className={styles.termsNote}>
            Bằng cách đặt hàng, bạn đồng ý với{" "}
            <a href="#">Điều khoản dịch vụ</a> và{" "}
            <a href="#">Chính sách bảo mật</a> của chúng tôi.
          </p>

        </div>

      </div>
    </div>
  );
}