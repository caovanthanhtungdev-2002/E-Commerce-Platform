import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProductStore } from "@/features/product/store/productStore";
import { useCategoryStore } from "@/features/category/store/categoryStore";
import { useCartStore } from "@/features/cart/store/cartStore";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import { getImageSrc } from "@/utils/getImage";
import { useToast } from "@/components/Toast";
import styles from "./ProductPage.module.css";

export default function ProductPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [sortBy, setSortBy] = useState("default");
  const [addingId, setAddingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { products, fetchProducts, searchProducts, loading, page, totalPages } = useProductStore();
  const { categories, tree, fetchCategories, fetchTree } = useCategoryStore();
  const { addToCart } = useCartStore();
  const { showToast } = useToast();

  const categoryId = searchParams.get("categoryId");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const categoryName = searchParams.get("categoryName") || "Tất cả sản phẩm";

  useEffect(() => {
    fetchCategories(0);
    fetchTree();
  }, []);

  useEffect(() => {
    const kw = searchParams.get("keyword") || "";
    setKeyword(kw);

    if (kw || categoryId || minPrice || maxPrice) {
      searchProducts({
        keyword: kw || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
    } else {
      fetchProducts(0);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setSearchParams({ keyword: keyword.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryClick = (id: number, name: string) => {
    setSearchParams({ categoryId: String(id), categoryName: name });
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: number, productName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
      showToast(`Đã thêm "${productName}" vào giỏ hàng! 🛒`, "success");
    } catch {
      showToast("Thêm vào giỏ hàng thất bại", "error");
    } finally {
      setAddingId(null);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return (b.avgRating || 0) - (a.avgRating || 0);
    return 0;
  });

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>📂 Danh mục</h3>

            <button
              className={`${styles.catBtn} ${!categoryId ? styles.catBtnActive : ""}`}
              onClick={() => setSearchParams({})}
            >
              Tất cả sản phẩm
            </button>

            {tree.map((cat) => (
              <div key={cat.id}>
                <button
                  className={`${styles.catBtn} ${categoryId === String(cat.id) ? styles.catBtnActive : ""}`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onClick={() => {
                    handleCategoryClick(cat.id, cat.name);
                    setExpandedId(expandedId === cat.id ? null : cat.id);
                  }}
                >
                  <span>{cat.name}</span>
                  {cat.children && cat.children.length > 0 && (
                    <span style={{ fontSize: "10px", marginLeft: "8px" }}>
                      {expandedId === cat.id ? "▲" : "▼"}
                    </span>
                  )}
                </button>

                {expandedId === cat.id && cat.children && cat.children.length > 0 && (
                  <div style={{ paddingLeft: "12px" }}>
                    {cat.children.map((sub) => (
                      <button
                        key={sub.id}
                        className={`${styles.catBtn} ${categoryId === String(sub.id) ? styles.catBtnActive : ""}`}
                        onClick={() => handleCategoryClick(sub.id, sub.name)}
                      >
                        · {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>💰 Lọc giá</h3>
            {[
              { label: "Dưới 2 triệu",    min: 0,        max: 2000000   },
              { label: "2 - 5 triệu",     min: 2000000,  max: 5000000   },
              { label: "5 - 10 triệu",    min: 5000000,  max: 10000000  },
              { label: "10 - 20 triệu",   min: 10000000, max: 20000000  },
              { label: "Trên 20 triệu",   min: 20000000, max: 999999999 },
            ].map((range) => (
              <button
                key={range.label}
                className={styles.catBtn}
                onClick={() => {
                  const params: any = {};
                  if (categoryId) {
                    params.categoryId = categoryId;
                    params.categoryName = categoryName;
                  }
                  params.minPrice = range.min;
                  params.maxPrice = range.max;
                  setSearchParams(params);
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <div className={styles.main}>
          <div className={styles.topBar}>
            <div className={styles.breadcrumb}>
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <span>{categoryName}</span>
            </div>
            <h1 className={styles.pageTitle}>{categoryName}</h1>
          </div>

          <div className={styles.filterBar}>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <input
                className={styles.searchInput}
                placeholder="Tìm kiếm sản phẩm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button type="submit" className={styles.searchBtn}>🔍 Tìm</button>
            </form>

            <div className={styles.sortWrap}>
              <span>Sắp xếp:</span>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          <div className={styles.resultCount}>
            {loading ? "Đang tải..." : `Tìm thấy ${products.length} sản phẩm`}
          </div>

          {loading ? (
            <div className={styles.loadingGrid}>
              {[...Array(8)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : (
            <div className={styles.grid}>
              {sortedProducts.map((p) => (
                <Link key={p.id} to={`/products/${p.id}`} className={styles.card}>
                  <div className={styles.cardImg}>
                    <img
                      src={getImageSrc(p.imageUrl)}
                      alt={p.name}
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/200x200/f5f5f5/999?text=SP"; }}
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardCat}>{p.categoryName}</p>
                    <h3 className={styles.cardName}>{p.name}</h3>
                    <div className={styles.cardPriceRow}>
                      <span className={styles.cardPrice}>{formatCurrencyVND(p.price)}</span>
                    </div>
                    {p.avgRating ? (
                      <div className={styles.cardRating}>
                        {"★".repeat(Math.round(p.avgRating))}
                        <span>{p.reviewCount} đánh giá</span>
                      </div>
                    ) : null}
                    <button
                      className={`${styles.cartBtn} ${addingId === p.id ? styles.cartBtnLoading : ""}`}
                      onClick={(e) => handleAddToCart(e, p.id, p.name)}
                      disabled={addingId === p.id}
                    >
                      {addingId === p.id ? "Đang thêm..." : "🛒 Thêm giỏ hàng"}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 0}
                onClick={() => fetchProducts(page - 1, categoryId ? Number(categoryId) : undefined)}
              >← Trước</button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                <button
                  key={i}
                  className={`${styles.pageNum} ${i === page ? styles.pageNumActive : ""}`}
                  onClick={() => fetchProducts(i, categoryId ? Number(categoryId) : undefined)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                disabled={page + 1 >= totalPages}
                onClick={() => fetchProducts(page + 1, categoryId ? Number(categoryId) : undefined)}
              >Sau →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}