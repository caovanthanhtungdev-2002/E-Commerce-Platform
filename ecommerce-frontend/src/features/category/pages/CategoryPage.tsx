import { useEffect } from "react";
import { useCategoryStore } from "../store/categoryStore";
import CategoryCard from "../components/CategoryCard";
import styles from "./CategoryPage.module.css";

export default function CategoryPage() {
  const { categories, fetchCategories, loading, page, totalPages } =
    useCategoryStore();

  useEffect(() => {
    fetchCategories(0);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>

      <div className={styles.container}>
        <h1 className={styles.title}>Categories</h1>

        {loading && <p className={styles.message}>Loading...</p>}

        {!loading && categories.length === 0 && (
          <p className={styles.message}>No categories found</p>
        )}

        <div className={styles.grid}>
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>

        <div className={styles.pagination}>
          <button
            disabled={page === 0}
            onClick={() => fetchCategories(page - 1)}
            className={styles.button}
          >
            Prev
          </button>

          <span className={styles.pageInfo}>
            {page + 1} / {totalPages}
          </span>

          <button
            disabled={page + 1 >= totalPages}
            onClick={() => fetchCategories(page + 1)}
            className={styles.button}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}