import styles from "./CartItemCard.module.css";
import { useCartStore } from "../store/cartStore";
import type { CartItem } from "../types/cartTypes";
import { formatCurrencyVND } from "@/utils/formatCurrency";

const BASE_URL = "http://localhost:8080";

export default function CartItemCard({ item }: { item: CartItem }) {
  const { removeFromCart, toggleSelect, updateQuantity } =
    useCartStore();

  const imageSrc = item.imageUrl
    ? item.imageUrl.startsWith("http")
      ? item.imageUrl
      : BASE_URL + item.imageUrl
    : "https://picsum.photos/80";

  return (
    <div className={styles.card}>
      <input
        type="checkbox"
        checked={item.selected}
        onChange={() => toggleSelect(item.productId)}
      />

      <img
        src={imageSrc}
        className={styles.image}
        onError={(e) => {
          e.currentTarget.src = "https://picsum.photos/80";
        }}
      />

      <div className={styles.info}>
        <h4>{item.productName}</h4>

        {/* PRICE */}
        <p className={styles.price}>
          {formatCurrencyVND(Number(item.price))}
        </p>

        {/* QUANTITY */}
        <div className={styles.qty}>
          <button
            onClick={() =>
              item.quantity > 1 &&
              updateQuantity(item.productId, item.quantity - 1)
            }
          >
            -
          </button>

          <span>{item.quantity}</span>

          <button
            onClick={() =>
              updateQuantity(item.productId, item.quantity + 1)
            }
          >
            +
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className={styles.right}>
        <p className={styles.subtotal}>
          {formatCurrencyVND(
            Number(item.price) * item.quantity
          )}
        </p>

        <button
          className={styles.remove}
          onClick={() => removeFromCart(item.productId)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}