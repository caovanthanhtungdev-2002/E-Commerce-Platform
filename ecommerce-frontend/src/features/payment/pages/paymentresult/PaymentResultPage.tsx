import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/config/axios";
import { useCartStore } from "@/features/cart/store/cartStore";
import { cancelOrder } from "@/features/payment/services/paymentService";
import styles from "./PaymentResultPage.module.css";

type Status = "loading" | "success" | "failed" | "error";

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
  const allParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    allParams[key] = value;
  });

  const responseCode = allParams["vnp_ResponseCode"];
  const isSuccess = responseCode === "00";
  const query = new URLSearchParams(allParams).toString();

  axiosInstance
    .get(`/api/payments/vnpay/callback?${query}`)
    .then(async (res) => {
      const orderId = res.data;

      if (!orderId || orderId === "INVALID_SIGNATURE" || orderId === "INVALID_PARAMS") {
        setStatus("error");
        return;
      }

      if (isSuccess) {
        setStatus("success");
        try {
          const orderRes = await axiosInstance.get(`/api/orders/${orderId}`);
          const orderItems = orderRes.data?.data?.items ?? [];
          const { removeFromCart } = useCartStore.getState();
          for (const item of orderItems) {
            await removeFromCart(item.productId);
          }
        } catch (err) {
          console.error("Không thể xóa sản phẩm khỏi giỏ hàng:", err);
        }
      } else {
        try {
          await cancelOrder(orderId);
        } catch (err) {
          console.error("Không thể hủy đơn hàng:", err);
        }
        setStatus("failed");
      }

      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 1500);
    })
    .catch(() => {
      setStatus("error");
    });
}, []);

  return (
    <div className={styles.container}>
      {status === "loading" && (
        <>
          <div className={styles.iconSmall}></div>
          <h2>Đang xác nhận thanh toán...</h2>
          <p className={styles.textMuted}>Vui lòng không đóng trang này</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className={styles.iconLarge}></div>
          <h1 className={styles.titleSuccess}>Thanh toán thành công!</h1>
          <p className={styles.textMuted}>
            Đang chuyển đến trang đơn hàng...
          </p>
        </>
      )}

      {status === "failed" && (
        <>
          <div className={styles.iconLarge}></div>
          <h1 className={styles.titleFailed}>Thanh toán thất bại</h1>
          <p className={styles.textMuted}>
            Đang chuyển về trang đơn hàng...
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <div className={styles.iconLarge}></div>
          <h1 className={styles.titleError}>Có lỗi xảy ra</h1>
          <p className={styles.textMuted}>
            Chữ ký không hợp lệ hoặc phiên đã hết hạn.
          </p>
          <button
            className={styles.button}
            onClick={() => navigate("/orders")}
          >
            Xem lịch sử đơn hàng
          </button>
        </>
      )}
    </div>
  );
}
