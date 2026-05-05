import styles from "./PaymentMethod.module.css";

interface Props {
  method: string;
  setMethod: (m: string) => void;
}

export default function PaymentMethod({ method, setMethod }: Props) {
  return (
    <div className={styles.wrapper}>
      <h3>Phương thức thanh toán</h3>

      <div
        className={`${styles.item} ${
          method === "VNPAY" ? styles.active : ""
        }`}
        onClick={() => setMethod("VNPAY")}
      >
        VNPay
      </div>

      <div
        className={`${styles.item} ${
          method === "COD" ? styles.active : ""
        }`}
        onClick={() => setMethod("COD")}
      >
      Thanh toán khi nhận hàng
      </div>
    </div>
  );
}