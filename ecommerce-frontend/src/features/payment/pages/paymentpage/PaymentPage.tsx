import { useState, useEffect } from "react";
import { useOrderStore } from "@/features/order/store/orderStore";
import { usePaymentStore } from "../../store/paymentStore";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./PaymentPage.module.css";

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { currentOrder, fetchOrder } = useOrderStore();
  const { pay, loading } = usePaymentStore();

  const [method, setMethod] = useState("VNPAY");
  const [voucher, setVoucher] = useState("");

  //fetch order
  useEffect(() => {
    if (orderId) {
      fetchOrder(Number(orderId));
    }
  }, [orderId]);

  // redirect nếu đã PAID
  useEffect(() => {
    if (!currentOrder) return;

    if (currentOrder.status === "PAID") {
      navigate(`/orders/${currentOrder.id}`);
    }
  }, [currentOrder]);

  if (!currentOrder) return <p>Loading order...</p>;

  const handlePay = async () => {
  if (!currentOrder) return;

  console.log("STATUS >>>", currentOrder.status);

  if (currentOrder.status !== "PENDING") {
    alert("Đơn hàng không hợp lệ để thanh toán");
    return;
  }

  if (method === "COD") {
    navigate(`/orders/${currentOrder.id}`);
    return;
  }

  try {
    const url = await pay(currentOrder.id);

    if (url) {
      window.location.href = url;
    }
  } catch (err: any) {
    console.error(err);
    alert(err?.response?.data?.message || "Thanh toán thất bại");
  }
};

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* LEFT */}
        <div>

          {/* ADDRESS */}
          <div className={styles.block}>
            <div className={styles.title}>Địa chỉ nhận hàng</div>
            <div className={styles.address}>
              <div>
                <strong>Nguyễn Văn A</strong> | 0123456789 <br />
                123 Đường ABC, Quận 1, TP.HCM
              </div>
              <button>Thay đổi</button>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className={styles.block}>
            <div className={styles.title}>Sản phẩm</div>

            {currentOrder.items.map((item) => (
              <div key={item.productId} className={styles.item}>
                <span>{item.productName} x{item.quantity}</span>
                <span>
                  {(item.price * item.quantity).toLocaleString()} đ
                </span>
              </div>
            ))}
          </div>

          {/* VOUCHER */}
          <div className={styles.block}>
            <div className={styles.title}>Voucher</div>

            <div className={styles.voucherBox}>
              <input
                placeholder="Nhập mã giảm giá"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
              />
              <button>Áp dụng</button>
            </div>
          </div>

          {/* PAYMENT */}
          <div className={styles.block}>
            <div className={styles.title}>Phương thức thanh toán</div>

            <div
              className={`${styles.methodItem} ${method === "VNPAY" ? styles.active : ""}`}
              onClick={() => setMethod("VNPAY")}
            >
               VNPay
            </div>

            <div
              className={`${styles.methodItem} ${method === "COD" ? styles.active : ""}`}
              onClick={() => setMethod("COD")}
            >
               COD
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.summary}>
          <h3>Tổng thanh toán</h3>

          <div className={styles.row}>
            <span>Tạm tính</span>
            <span>{currentOrder.totalPrice.toLocaleString()} đ</span>
          </div>

          <div className={styles.row}>
            <span>Giảm giá</span>
            <span>-{currentOrder.discount.toLocaleString()} đ</span>
          </div>

          <div className={styles.total}>
            {currentOrder.finalPrice.toLocaleString()} đ
          </div>

         <button
  className={styles.payBtn}
  onClick={handlePay}
  disabled={loading || currentOrder.status !== "PENDING"}
>
  {loading
    ? "Đang xử lý..."
    : currentOrder.status !== "PENDING"
    ? "Không thể thanh toán"
    : "Thanh toán"}
</button>
        </div>

      </div>
    </div>
  );
}