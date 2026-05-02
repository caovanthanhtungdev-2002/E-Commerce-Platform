import { useEffect } from "react";
import { useCartStore } from "../store/cartStore";
import CartItemCard from "../components/CartItemCard";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const { items, fetchCart, loading } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const selectedItems = items.filter((i) => i.selected);

  const total = selectedItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
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
          Total ({selectedItems.length} items): 
          <b>${total.toFixed(2)}</b>
        </span>

        <button className={styles.checkoutBtn}>
          Checkout
        </button>
      </div>
    </div>
  );
}