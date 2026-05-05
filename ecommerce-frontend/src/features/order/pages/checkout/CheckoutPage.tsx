import { useState, useEffect } from "react";
import { useOrderStore } from "../../store/orderStore";
import { useNavigate } from "react-router-dom";
import styles from "./CheckoutPage.module.css";
import { useCartStore } from "@/features/cart/store/cartStore";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import { getImageSrc } from "@/utils/getImage";


export default function CheckoutPage() {
  const [coupon, setCoupon] = useState("");

  const { create, loading } = useOrderStore();
  const { items, totalPrice, fetchCart } = useCartStore();

  const navigate = useNavigate();

  
  useEffect(() => {
    fetchCart();
  }, []);

  const handleCheckout = async () => {
    await create(coupon);

    const order = useOrderStore.getState().currentOrder;

    if (order) {
      navigate(`/payment/${order.id}`);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* LEFT */}
        <div className={styles.left}>
          <h2>Checkout</h2>

          <div className={styles.items}>
  {items.map((item) => (
    <div key={item.productId} className={styles.item}>
      
      
     <div className={styles.itemLeft}>
  <img
    src={getImageSrc(item.imageUrl)}
    className={styles.image}
    onError={(e) => {
      e.currentTarget.src = "https://picsum.photos/80";
    }}
  />

  <div>
    <h4>{item.productName}</h4>
    <p>Qty: {item.quantity}</p>
  </div>
</div>

      <div className={styles.itemRight}>
  {formatCurrencyVND(item.price * item.quantity)}
</div>

    </div>
  ))}
</div>

          <div className={styles.card}>
            <p className={styles.label}>Coupon</p>
            <input
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <div className={styles.summary}>
            <h3>Order Summary</h3>

            <div className={styles.row}>
  <span>Subtotal</span>
  <span>{formatCurrencyVND(totalPrice)}</span>
</div>

<div className={styles.row}>
  <span>Discount</span>
  <span>{formatCurrencyVND(0)}</span>
</div>

<div className={styles.total}>
  <span>Total</span>
  <span>{formatCurrencyVND(totalPrice)}</span>
</div>

            <button onClick={handleCheckout} disabled={loading}>
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}