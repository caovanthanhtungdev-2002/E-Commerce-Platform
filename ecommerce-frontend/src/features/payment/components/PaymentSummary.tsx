import styles from "./PaymentSummary.module.css";

interface Props {
  total: number;
  onPay: () => void;
  loading: boolean;
}

export default function PaymentSummary({ total, onPay, loading }: Props) {
  return (
    <div className={styles.card}>
      <h3>Tổng thanh toán</h3>

      <div className={styles.row}>
        <span>Tổng tiền</span>
        <span>{total.toLocaleString()} đ</span>
      </div>

      <button onClick={onPay} disabled={loading}>
        {loading ? "Đang xử lý..." : "Thanh toán"}
      </button>
    </div>
  );
}