import type { OrderItem } from "../types/orderTypes";
import styles from "./OrderItemCard.module.css";
import { formatCurrencyVND } from "@/utils/formatCurrency";

export default function OrderItemCard({ item }: { item: OrderItem }) {
  return (
    <div className={styles.card}>
      <div>
        <h4>{item.productName}</h4>
        <p>Qty: {item.quantity}</p>
      </div>

      <div className={styles.price}>
  {formatCurrencyVND(item.price * item.quantity)}
</div>
    </div>
  );
}