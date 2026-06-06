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

  useEffect(() => {
    if (!id) return;
    useOrderStore.setState({ currentOrder: null, error: null });
    fetchOrder(Number(id)).finally(() => setFetched(true));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    window.history.replaceState(null, "", `/payment/${id}`);
  }, [id]);

  useEffect(() => {
    if (currentOrder?.status === "PAID") {
      navigate(`/orders/${currentOrder.id}`, { replace: true });
    }
  }, [currentOrder]);

  if (!fetched || orderLoading) {
    return (
      <div className={styles.center}>
        <div className={styles.loadingSpinner} />
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

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

  const handlePay = async () => {
    if (currentOrder.status !== "AWAITING_PAYMENT") {
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

  return (
    <div className={styles.page}>

      <div className={styles.breadcrumb}>
        <span style={{ cursor: "pointer", color: "#888" }} onClick={() => navigate("/cart")}>
          Giỏ hàng
        </span>
        <span className={styles.chevron}>›</span>
        <span style={{ cursor: "pointer", color: "#888" }} onClick={() => navigate("/cart")}>
          Thanh toán
        </span>
        <span className={styles.chevron}>›</span>
        <span className={styles.active}>Xác nhận &amp; Thanh toán</span>
      </div>

      <div className={styles.container}>

        <div className={styles.left}>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardHeaderIcon}>📍</span>
              <span className={styles.cardHeaderTitle}>Địa chỉ nhận hàng</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.addressRow}>
                <div className={styles.addressIcon}>📦</div>
                <div className={styles.addressDetails}>
                  <div className={styles.addressName}>{currentOrder.receiverName || "—"}</div>
                  <div className={styles.addressPhone}>📞 {currentOrder.phone || "—"}</div>
                  <div className={styles.addressText}>{currentOrder.address || "—"}</div>
                  <span className={styles.addressDefaultTag}>Địa chỉ giao hàng</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardHeaderIcon}>🛍️</span>
              <span className={styles.cardHeaderTitle}>
                Sản phẩm ({currentOrder.items.length})
              </span>
              <span className={styles.cardHeaderBadge}>Đơn #{currentOrder.id}</span>
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
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
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
            disabled={payLoading || currentOrder.status !== "AWAITING_PAYMENT"}
          >
            {payLoading ? (
              <>
                <span className={styles.payBtnIcon}>⏳</span>
                Đang xử lý...
              </>
            ) : currentOrder.status !== "AWAITING_PAYMENT" ? (
              "Không thể thanh toán"
            ) : (
              <>
                <span className={styles.payBtnIcon}>🏦</span>
                Thanh toán qua VNPAY
              </>
            )}
          </button>

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