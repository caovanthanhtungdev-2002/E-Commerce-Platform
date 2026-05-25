import type { OrderItem } from "../types/orderTypes";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import { getImageSrc } from "@/utils/getImage";
import styles from "./OrderItemCard.module.css";

export default function OrderItemCard({ item }: { item: OrderItem }) {
  return (
    <div className={styles.card}>
      <div className={styles.imgWrap}>
        <img
          src={getImageSrc(item.imageUrl)}
          alt={item.productName}
          className={styles.img}
          onError={(e) => { e.currentTarget.src = "https://picsum.photos/72"; }}
        />
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{item.productName}</div>
        <div className={styles.qty}>x{item.quantity}</div>
      </div>
      <div className={styles.price}>
        {formatCurrencyVND(item.price * item.quantity)}
      </div>
    </div>
  );
}