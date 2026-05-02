import type { Category } from "../types/categoryTypes";
import styles from "./CategoryCard.module.css";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.name}>{category.name}</h2>

      <p className={styles.desc}>
        {category.description || "No description"}
      </p>

      <span
        className={`${styles.badge} ${
          category.isActive ? styles.active : styles.inactive
        }`}
      >
        {category.isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}