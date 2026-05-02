import { useEffect, useState } from "react";
import { useProductStore } from "../store/productStore";
import ProductCard from "../components/ProductCard";
import styles from "./ProductPage.module.css";

export default function ProductPage() {
  const { products, fetchProducts, searchProducts, loading } =
    useProductStore();

  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetchProducts(0);
  }, []);

  const handleSearch = () => {
    searchProducts(keyword);
  };

  return (
    <div className={styles.page}>
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>

      <div className={styles.container}>
        <h1 className={styles.title}>Products</h1>

        {/* Search */}
        <div className={styles.searchBox}>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search product..."
            className={styles.input}
          />
          <button onClick={handleSearch} className={styles.button}>
            Search
          </button>
        </div>

        {/* Loading */}
        {loading && <p className={styles.message}>Loading...</p>}

        {/* List */}
        <div className={styles.grid}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}