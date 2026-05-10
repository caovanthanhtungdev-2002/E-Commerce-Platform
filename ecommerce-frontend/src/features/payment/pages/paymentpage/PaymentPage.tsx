import { useEffect, useState } from "react";
import { useOrderStore } from "@/features/order/store/orderStore";
import { usePaymentStore } from "@/features/payment/store/paymentStore";
import { useNavigate, useParams } from "react-router-dom";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import { getImageSrc } from "@/utils/getImage";
import styles from "./PaymentPage.module.css";


export default function PaymentPage() {

  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentOrder,
    fetchOrder,
    loading: orderLoading,
    error: orderError,
  } = useOrderStore();

  const { pay, loading: payLoading } = usePaymentStore();

  const [fetched, setFetched] = useState(false);

  // =========================================
  // FETCH ORDER
  // =========================================

  useEffect(() => {
    if (!id) return;
    useOrderStore.setState({ currentOrder: null, error: null });
    fetchOrder(Number(id)).finally(() => setFetched(true));
  }, [id]);

  // =========================================
  // CHẶN BACK VỀ CHECKOUT
  // =========================================

  useEffect(() => {
    if (!id) return;
    // Thay thế history entry để back không về checkout
    window.history.replaceState(null, "", `/payment/${id}`);
  }, [id]);

  // =========================================
  // REDIRECT NẾU ĐÃ PAID
  // =========================================

  useEffect(() => {
    if (currentOrder?.status === "PAID") {
      navigate(`/orders/${currentOrder.id}`, { replace: true });
    }
  }, [currentOrder]);

  // =========================================
  // LOADING
  // =========================================

  if (!fetched || orderLoading) {
    return (
      <div className={styles.center}>
        <div className={styles.loadingSpinner} />
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (orderError || !currentOrder) {
    return (
      <div className={styles.center}>
        <span className={styles.errorIcon}>⚠️</span>
        <p className={styles.errorText}>
          {orderError || "Không tìm thấy đơn hàng"}
        </p>
        <button className={styles.backBtn} onClick={() => navigate("/orders")}>
          ← Quay lại đơn hàng
        </button>
      </div>
    );
  }

  // =========================================
  // HANDLE PAY → redirect VNPAY
  // =========================================

  const handlePay = async () => {
    if (currentOrder.status !== "PENDING") {
      alert("Đơn hàng không hợp lệ để thanh toán");
      return;
    }
    try {
      const url = await pay(currentOrder.id);
      if (url) window.location.href = url;
    } catch (err: any) {
      alert(err?.response?.data?.message || "Thanh toán thất bại");
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className={styles.page}>

      {/* BREADCRUMB */}
      <div className={styles.breadcrumb}>
        <span
          style={{ cursor: "pointer", color: "#888" }}
          onClick={() => navigate("/cart")}
        >
          Giỏ hàng
        </span>
        <span className={styles.chevron}>›</span>
        <span
          style={{ cursor: "pointer", color: "#888" }}
          onClick={() => navigate("/cart")}
        >
          Thanh toán
        </span>
        <span className={styles.chevron}>›</span>
        <span className={styles.active}>Xác nhận &amp; Thanh toán</span>
      </div>

      <div className={styles.container}>

        {/* ================================= */}
        {/* LEFT                              */}
        {/* ================================= */}

        <div className={styles.left}>

          {/* ĐỊA CHỈ GIAO HÀNG */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardHeaderIcon}>📍</span>
              <span className={styles.cardHeaderTitle}>Địa chỉ nhận hàng</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.addressRow}>

                <div className={styles.addressIcon}>📦</div>

                <div className={styles.addressDetails}>
                  <div className={styles.addressName}>
                    {currentOrder.receiverName || "—"}
                  </div>
                  <div className={styles.addressPhone}>
                    📞 {currentOrder.phone || "—"}
                  </div>
                  <div className={styles.addressText}>
                    {currentOrder.address || "—"}
                  </div>
                  <span className={styles.addressDefaultTag}>Địa chỉ giao hàng</span>
                </div>

              </div>
            </div>
          </div>

          {/* SẢN PHẨM */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardHeaderIcon}>🛍️</span>
              <span className={styles.cardHeaderTitle}>
                Sản phẩm ({currentOrder.items.length})
              </span>
              <span className={styles.cardHeaderBadge}>
                Đơn #{currentOrder.id}
              </span>
            </div>

            <div className={styles.cardBody} style={{ padding: "0 20px" }}>
              <div className={styles.itemList}>
                {currentOrder.items.map((item) => (
                  <div key={item.productId} className={styles.item}>

                    <div className={styles.itemLeft}>
                      {item.imageUrl ? (
                        <img
                          src={getImageSrc(item.imageUrl)}
                          className={styles.itemImg}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className={styles.itemImgPlaceholder}>📱</div>
                      )}
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{item.productName}</div>
                        <span className={styles.itemQtyTag}>x{item.quantity}</span>
                      </div>
                    </div>

                    <div className={styles.itemPrice}>
                      {formatCurrencyVND(item.price * item.quantity)}
                    </div>

                  </div>
                ))}
              </div>
            </div>

            <div className={styles.shippingRow}>
              <div className={styles.shippingRowLeft}>
                <span>🚚</span>
                <span>Vận chuyển nhanh · Nhận trong 2–3 ngày</span>
              </div>
              <span className={styles.shippingFree}>Miễn phí</span>
            </div>
          </div>

          {/* PHƯƠNG THỨC THANH TOÁN */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardHeaderIcon}>💳</span>
              <span className={styles.cardHeaderTitle}>Phương thức thanh toán</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.methodDisplay}>
                <span className={styles.methodIcon}>🏦</span>
                <div className={styles.methodInfo}>
                  <div className={styles.methodName}>VNPAY</div>
                  <div className={styles.methodSub}>
                    Thanh toán qua cổng VNPAY — ATM / Visa / QR
                  </div>
                </div>
                <span className={styles.methodCheck}>✓</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================================= */}
        {/* RIGHT                             */}
        {/* ================================= */}

        <div className={styles.right}>

          <div className={styles.summary}>
            <div className={styles.summaryHeader}>Tổng thanh toán</div>
            <div className={styles.summaryBody}>

              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>
                  Tạm tính ({currentOrder.items.length} sản phẩm)
                </span>
                <span className={styles.summaryRowValue}>
                  {formatCurrencyVND(currentOrder.totalPrice)}
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Phí vận chuyển</span>
                <span style={{ color: "#26aa99", fontWeight: 700, fontSize: "14px" }}>
                  Miễn phí
                </span>
              </div>

              {currentOrder.discount > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryRowLabel}>Giảm giá voucher</span>
                  <span style={{ color: "#26aa99", fontWeight: 700, fontSize: "14px" }}>
                    -{formatCurrencyVND(currentOrder.discount)}
                  </span>
                </div>
              )}

              <div className={styles.summaryDivider} />

              <div className={styles.summaryTotal}>
                <span className={styles.summaryTotalLabel}>Tổng cộng</span>
                <span className={styles.summaryTotalValue}>
                  {formatCurrencyVND(currentOrder.finalPrice)}
                </span>
              </div>

              {currentOrder.discount > 0 && (
                <p className={styles.savingsNote}>
                  🎉 Bạn tiết kiệm {formatCurrencyVND(currentOrder.discount)}
                </p>
              )}

            </div>
          </div>

          <button
            className={styles.payBtn}
            onClick={handlePay}
            disabled={payLoading || currentOrder.status !== "PENDING"}
          >
            {payLoading ? (
              <>
                <span className={styles.payBtnIcon}>⏳</span>
                Đang xử lý...
              </>
            ) : currentOrder.status !== "PENDING" ? (
              "Không thể thanh toán"
            ) : (
              <>
                <span className={styles.payBtnIcon}>🏦</span>
                Thanh toán qua VNPAY
              </>
            )}
          </button>

          {/* Thanh toán sau → về trang quản lý đơn hàng, không về checkout */}
          <button
            className={styles.cancelBtn}
            onClick={() => navigate(`/orders/${currentOrder.id}`, { replace: true })}
          >
            Thanh toán sau
          </button>

          <div className={styles.secureNote}>
            🔒 Thanh toán được bảo mật bởi VNPAY
          </div>

        </div>

      </div>
    </div>
  );
}