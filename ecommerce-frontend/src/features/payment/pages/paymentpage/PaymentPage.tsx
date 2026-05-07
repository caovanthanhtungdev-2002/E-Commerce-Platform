import { useState, useEffect } from "react";
import { useOrderStore } from "@/features/order/store/orderStore";
import { usePaymentStore } from "@/features/payment/store/paymentStore";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./PaymentPage.module.css";

export default function PaymentPage() {
  const { id } = useParams(); // route là /payment/:id
  const navigate = useNavigate();

  const { currentOrder, fetchOrder, loading: orderLoading, error: orderError } = useOrderStore();
  const { pay, loading: payLoading } = usePaymentStore();

  const [method, setMethod] = useState("VNPAY");
  const [voucher, setVoucher] = useState("");
  const [fetched, setFetched] = useState(false); 

  // Fetch order khi mount
  useEffect(() => {
    if (!id) return;

    // Reset state cũ trước khi fetch mới
    useOrderStore.setState({ currentOrder: null, error: null });

    fetchOrder(Number(id)).finally(() => {
      setFetched(true); 
    });
  }, [id]);

  // Redirect nếu đã PAID
  useEffect(() => {
    if (currentOrder?.status === "PAID") {
      navigate(`/orders/${currentOrder.id}`);
    }
  }, [currentOrder]);

  // ===== LOADING =====
  if (!fetched || orderLoading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  // ===== ERROR =====
  if (orderError || !currentOrder) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p style={{ color: "red" }}>
         {orderError || "Không tìm thấy đơn hàng"}
        </p>
        <button onClick={() => navigate("/orders")}>← Quay lại đơn hàng</button>
      </div>
    );
  }

  // ===== HANDLE PAY =====
  const handlePay = async () => {
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

  // ===== RENDER =====
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
    <strong>{currentOrder.receiverName}</strong> | {currentOrder.phone} <br />
    {currentOrder.address}
  </div>
</div>
          </div>

          {/* PRODUCTS */}
          <div className={styles.block}>
            <div className={styles.title}>Sản phẩm</div>
            {currentOrder.items.map((item) => (
              <div key={item.productId} className={styles.item}>
                <span>{item.productName} x{item.quantity}</span>
                <span>{(item.price * item.quantity).toLocaleString()} đ</span>
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

          {/* PAYMENT METHOD */}
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

        {/* RIGHT — SUMMARY */}
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
            disabled={payLoading || currentOrder.status !== "PENDING"}
          >
            {payLoading
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
