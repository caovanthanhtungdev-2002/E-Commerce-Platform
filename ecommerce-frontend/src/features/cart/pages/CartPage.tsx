import { useEffect } from "react";
import { useCartStore } from "../store/cartStore";
import CartItemCard from "../components/CartItemCard";
import styles from "./CartPage.module.css";
import { useNavigate } from "react-router-dom";
import { formatCurrencyVND } from "@/utils/formatCurrency";

export default function CartPage() {
  const navigate = useNavigate();

  const { items, fetchCart, loading } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const selectedItems = items.filter((i) => i.selected);

  const total = selectedItems.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2>Shopping Cart</h2>

        {loading && <p>Loading...</p>}

        <div className={styles.list}>
          {items.map((item) => (
            <CartItemCard key={item.productId} item={item} />
          ))}
        </div>
      </div>

      {/* CHECKOUT BAR */}
      <div className={styles.checkoutBar}>
        <span>
          Total ({selectedItems.length} items):{" "}
          <b>{formatCurrencyVND(total)}</b>
        </span>

        <button
          className={styles.checkoutBtn}
          onClick={() => navigate("/checkout")}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}