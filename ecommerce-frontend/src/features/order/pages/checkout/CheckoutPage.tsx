import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useOrderStore } from "../../store/orderStore";
import { useCartStore } from "@/features/cart/store/cartStore";
import { useUserStore } from "@/features/user/store/userStore";

import type { Address } from "@/features/user/types/userTypes";

import { formatCurrencyVND } from "@/utils/formatCurrency";
import { getImageSrc } from "@/utils/getImage";
import { useShippingFee } from "@/hooks/useShippingFee";
import api from "@/config/axios";

import styles from "./CheckoutPage.module.css";

const SS_COUPON   = "checkout_coupon";
const SS_FREESHIP = "checkout_freeship";
const SS_METHOD   = "checkout_method";

export default function CheckoutPage() {

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const { shippingFee, loadingFee } = useShippingFee(selectedAddress?.province ?? null);
  const shippingFeeAmount = shippingFee?.fee ?? 0;

  const [coupon, setCoupon] = useState(
    () => sessionStorage.getItem(SS_COUPON) || ""
  );
  const [freeship, setFreeship] = useState(
    () => sessionStorage.getItem(SS_FREESHIP) || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">(
    () => (sessionStorage.getItem(SS_METHOD) as "COD" | "VNPAY") || "COD"
  );
  const [cartReady, setCartReady] = useState(false);

  // ── COUPON STATE ──────────────────────────────────────────
  const [discountAmount, setDiscountAmount]       = useState(0);
  const [couponError, setCouponError]             = useState("");
  const [couponApplied, setCouponApplied]         = useState(false);

  const [freeshipDiscount, setFreeshipDiscount]   = useState(0);
  const [freeshipError, setFreeshipError]         = useState("");
  const [freeshipApplied, setFreeshipApplied]     = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;

  const { create, loading } = useOrderStore();
  const { items } = useCartStore();
  const { addresses, fetchProfile, fetchAddresses } = useUserStore();

  // ── INIT ──────────────────────────────────────────
  useEffect(() => {
    useOrderStore.setState({ currentOrder: null });
    fetchProfile();
    fetchAddresses();

    if (buyNowItem) {
      setCartReady(true);
      return;
    }

    const selected = useCartStore.getState().items.filter((i) => i.selected);
    if (selected.length === 0) {
      navigate("/cart", { replace: true });
      return;
    }

    setCartReady(true);
  }, []);

  // ── TỰ CHỌN ĐỊA CHỈ MẶC ĐỊNH KHI LOAD XONG ──────
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddress(def);
    }
  }, [addresses]);

  // reset freeship discount khi phí ship thay đổi (đổi địa chỉ)
  useEffect(() => {
    if (freeshipApplied) {
      setFreeshipDiscount(shippingFeeAmount);
    }
  }, [shippingFeeAmount]);

  useEffect(() => { sessionStorage.setItem(SS_COUPON,   coupon);   }, [coupon]);
  useEffect(() => { sessionStorage.setItem(SS_FREESHIP, freeship); }, [freeship]);
  useEffect(() => { sessionStorage.setItem(SS_METHOD,   paymentMethod); }, [paymentMethod]);

  // ── ITEMS ─────────────────────────────────────────
  const liveCartItems = items.filter((item) => item.selected);
  const checkoutItems = buyNowItem ? [buyNowItem] : liveCartItems;
  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity, 0
  );
  const finalTotal = subtotal + shippingFeeAmount - discountAmount - freeshipDiscount;

  const isValid = selectedAddress !== null && checkoutItems.length > 0;

  // ── APPLY COUPON (giảm giá sản phẩm) ─────────────
  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponError("");
    setCouponApplied(false);
    setDiscountAmount(0);
    try {
      const res = await api.post("/api/coupons/apply", {
        code: coupon.trim(),
        orderAmount: subtotal,
        shippingFee: shippingFeeAmount,
      });
      const data = res.data;
      if (data.type === "FREESHIP") {
        setCouponError("Đây là mã freeship, vui lòng nhập vào ô Mã freeship bên dưới");
        return;
      }
      setDiscountAmount(data.discount);
      setCouponApplied(true);
    } catch (err: any) {
      setDiscountAmount(0);
      setCouponError(err?.response?.data?.message || "Mã không hợp lệ");
    }
  };

  // ── APPLY FREESHIP ────────────────────────────────
  const handleApplyFreeship = async () => {
    if (!freeship.trim()) return;
    setFreeshipError("");
    setFreeshipApplied(false);
    setFreeshipDiscount(0);
    try {
      const res = await api.post("/api/coupons/apply", {
        code: freeship.trim(),
        orderAmount: subtotal,
        shippingFee: shippingFeeAmount,
      });
      const data = res.data;
      if (data.type !== "FREESHIP") {
        setFreeshipError("Đây không phải mã freeship");
        return;
      }
      setFreeshipDiscount(data.discount);
      setFreeshipApplied(true);
    } catch (err: any) {
      setFreeshipDiscount(0);
      setFreeshipError(err?.response?.data?.message || "Mã không hợp lệ");
    }
  };

  // ── CLEAR SESSION ─────────────────────────────────
  const clearCheckoutSession = () => {
    [SS_COUPON, SS_FREESHIP, SS_METHOD].forEach((key) => sessionStorage.removeItem(key));
  };

  // ── CHECKOUT ──────────────────────────────────────
  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert("Vui lòng chọn địa chỉ nhận hàng.");
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
       freeshipCode: freeship.trim() || undefined,
        shippingFee: shippingFeeAmount,
        paymentMethod,
        receiverName: selectedAddress.receiverName,
        phone: selectedAddress.receiverPhone,
        address: [
          selectedAddress.addressLine,
          selectedAddress.ward,
          selectedAddress.district,
          selectedAddress.province,
        ].filter(Boolean).join(", "),
        selectedProductIds,
        ...(buyNowItem && {
          buyNowItems: [{
            productId: buyNowItem.productId,
            quantity: buyNowItem.quantity,
          }],
        }),
      });

      const order = useOrderStore.getState().currentOrder;
      if (!order) return;

      clearCheckoutSession();

      if (paymentMethod === "COD") {
        navigate(`/orders/${order.id}`);
        return;
      }

      navigate(`/payment/${order.id}`);

    } catch (err: any) {
      alert(err?.response?.data?.message || "Đặt hàng thất bại");
    }
  };

  // ── LOADING ───────────────────────────────────────
  if (!cartReady) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px", flexDirection: "column", gap: "12px" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #eee", borderTop: "3px solid #e53935", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#888", fontSize: "14px" }}>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  // ── UI ────────────────────────────────────────────
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

          {/* ── ĐỊA CHỈ ── */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionHeaderIcon}>📍</span>
              <span className={styles.sectionHeaderTitle}>Địa chỉ nhận hàng</span>
              <a href="/profile" className={styles.addressHeaderLink}>
                + Thêm địa chỉ
              </a>
            </div>

            {addresses.length === 0 ? (
              <div className={styles.addressEmptyBox}>
                Bạn chưa có địa chỉ nào.{" "}
                <a href="/profile">Thêm ngay</a>
              </div>
            ) : (
              <div className={styles.addressList}>
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`${styles.addressOption} ${
                      selectedAddress?.id === addr.id ? styles.addressOptionSelected : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="checkout_address"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => setSelectedAddress(addr)}
                    />
                    <div className={styles.addressOptionBody}>
                      <div className={styles.addressOptionName}>
                        {addr.receiverName}
                        <span className={styles.addressOptionDot}>·</span>
                        <span className={styles.addressOptionPhone}>
                          {addr.receiverPhone}
                        </span>
                        {addr.isDefault && (
                          <span className={styles.addressBadgeDefault}>
                            Mặc định
                          </span>
                        )}
                      </div>
                      <div className={styles.addressOptionText}>
                        {addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* ── SẢN PHẨM ── */}
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
                        onError={(e) => { e.currentTarget.src = "https://picsum.photos/72"; }}
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
              <span style={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>
                {loadingFee
                  ? "Đang tính..."
                  : shippingFee?.feeFormatted ?? "—"}
              </span>
            </div>
          </div>

          {/* ── VOUCHER ── */}
          <div className={styles.sectionCard}>

            {/* Mã giảm giá sản phẩm */}
            <div className={styles.voucherRow}>
              <div className={styles.voucherLeft}>
                <span>🎟️</span>
                Mã giảm giá
              </div>
              <input
                className={styles.voucherInput}
                placeholder="Nhập mã giảm giá"
                value={coupon}
                onChange={(e) => {
                  setCoupon(e.target.value);
                  setDiscountAmount(0);
                  setCouponApplied(false);
                  setCouponError("");
                }}
              />
              <button className={styles.voucherApply} onClick={handleApplyCoupon}>
                Áp dụng
              </button>
            </div>
            {couponError && (
              <p style={{ color: "#e53935", fontSize: "12px", marginTop: "4px", paddingLeft: "4px" }}>
                ❌ {couponError}
              </p>
            )}
            {couponApplied && (
              <p style={{ color: "#2e7d32", fontSize: "12px", marginTop: "4px", paddingLeft: "4px" }}>
                ✅ Áp dụng thành công — Giảm {formatCurrencyVND(discountAmount)}
              </p>
            )}

            <div style={{ height: "12px" }} />

            {/* Mã freeship */}
            <div className={styles.voucherRow}>
              <div className={styles.voucherLeft}>
                <span>🚚</span>
                Mã freeship
              </div>
              <input
                className={styles.voucherInput}
                placeholder="Nhập mã freeship"
                value={freeship}
                onChange={(e) => {
                  setFreeship(e.target.value);
                  setFreeshipDiscount(0);
                  setFreeshipApplied(false);
                  setFreeshipError("");
                }}
              />
              <button className={styles.voucherApply} onClick={handleApplyFreeship}>
                Áp dụng
              </button>
            </div>
            {freeshipError && (
              <p style={{ color: "#e53935", fontSize: "12px", marginTop: "4px", paddingLeft: "4px" }}>
                ❌ {freeshipError}
              </p>
            )}
            {freeshipApplied && (
              <p style={{ color: "#2e7d32", fontSize: "12px", marginTop: "4px", paddingLeft: "4px" }}>
                ✅ Miễn phí vận chuyển — Giảm {formatCurrencyVND(freeshipDiscount)}
              </p>
            )}

          </div>

        </div>

        {/* ── RIGHT ── */}
        <div className={styles.right}>

          <div className={styles.summary}>
            <div className={styles.summaryHeader}>
              <h3>Tóm tắt đơn hàng</h3>
            </div>
            <div className={styles.summaryBody}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Tạm tính ({checkoutItems.length} sản phẩm)</span>
                <span className={styles.rowValue}>{formatCurrencyVND(subtotal)}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Phí vận chuyển</span>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                  {loadingFee
                    ? "Đang tính..."
                    : shippingFee
                      ? <span style={{ color: "#333" }}>{shippingFee.feeFormatted}</span>
                      : <span style={{ color: "#aaa" }}>—</span>}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Giảm giá voucher</span>
                  <span style={{ fontWeight: 600, fontSize: "14px", color: "#e53935" }}>
                    -{formatCurrencyVND(discountAmount)}
                  </span>
                </div>
              )}
              {freeshipDiscount > 0 && (
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Giảm phí vận chuyển</span>
                  <span style={{ fontWeight: 600, fontSize: "14px", color: "#e53935" }}>
                    -{formatCurrencyVND(freeshipDiscount)}
                  </span>
                </div>
              )}
              {discountAmount === 0 && freeshipDiscount === 0 && (
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Giảm giá voucher</span>
                  <span className={styles.rowValue}>{formatCurrencyVND(0)}</span>
                </div>
              )}
              <div className={styles.divider} />
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Tổng thanh toán</span>
                <span className={styles.totalValue}>{formatCurrencyVND(finalTotal)}</span>
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
                <input type="radio" value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")} />
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
                <input type="radio" value="VNPAY"
                  checked={paymentMethod === "VNPAY"}
                  onChange={() => setPaymentMethod("VNPAY")} />
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
            disabled={loading || !isValid || loadingFee}
          >
            {loading ? "Đang xử lý..." : `Đặt hàng · ${formatCurrencyVND(finalTotal)}`}
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
