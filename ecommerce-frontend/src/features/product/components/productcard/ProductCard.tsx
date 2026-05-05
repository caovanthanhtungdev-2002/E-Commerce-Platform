import styles from "./ProductCard.module.css";
import { useCartStore } from "@/features/cart/store/cartStore";
import type { Product } from "../../types/productTypes";

const BASE_URL = "http://localhost:8080";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCartStore();


  const imageSrc = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : BASE_URL + product.imageUrl 
    : "https://via.placeholder.com/200";

  return (
    <div className={styles.card}>
      <img
  src={imageSrc}
  alt={product.name}
  className={styles.image}
  onError={(e) => {
    e.currentTarget.src = "https://placehold.co/200x200";
  }}
/>

      <h3 className={styles.name}>{product.name}</h3>

      <p className={styles.category}>{product.categoryName}</p>

      <p className={styles.price}>
        {product.price.toLocaleString()} đ
      </p>

      <p className={styles.rating}>
        {product.avgRating || 0} ({product.reviewCount || 0})
      </p>

      <button
        className={styles.buyBtn}
        onClick={() => addToCart(product.id, 1)}
      >
        Mua ngay
      </button>
    </div>
  );
}