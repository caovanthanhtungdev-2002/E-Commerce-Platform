import { useEffect, useState } from "react";
import { adminDashboardService } from "../services/adminOtherServices";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import type { DashboardSummary } from "../types/adminTypes";
import styles from "./AdminDashboardPage.module.css";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenue, setRevenue] = useState<[string, number][]>([]);
  const [topProducts, setTopProducts] = useState<[string, number][]>([]);
  const [orderStats, setOrderStats] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminDashboardService.getSummary(),
      adminDashboardService.getRevenue(),
      adminDashboardService.getTopProducts(),
      adminDashboardService.getOrderStatusStats(),
    ]).then(([s, r, tp, os]) => {
      setSummary(s);
      setRevenue(r);
      setTopProducts(tp);
      setOrderStats(os);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  const STAT_CARDS = [
    { label: "Doanh thu", value: formatCurrencyVND(summary?.revenue || 0), icon: "💰", color: "#e53935" },
    { label: "Đơn hàng", value: summary?.orders || 0, icon: "🧾", color: "#1976d2" },
    { label: "Người dùng", value: summary?.users || 0, icon: "👥", color: "#388e3c" },
    { label: "Sản phẩm", value: summary?.products || 0, icon: "📦", color: "#f57c00" },
  ];

  const maxRevenue = Math.max(...revenue.map(([, v]) => v), 1);
  const maxTop = Math.max(...topProducts.map(([, v]) => v), 1);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <span className={styles.subtitle}>Tổng quan hệ thống</span>
      </div>

      {/* STAT CARDS */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((c) => (
          <div key={c.label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: c.color + "18", color: c.color }}>
              {c.icon}
            </div>
            <div>
              <div className={styles.statValue}>{c.value}</div>
              <div className={styles.statLabel}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsRow}>
        {/* REVENUE CHART */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>📈 Doanh thu theo ngày</h3>
          {revenue.length === 0 ? (
            <div className={styles.empty}>Chưa có dữ liệu</div>
          ) : (
            <div className={styles.barChart}>
              {revenue.slice(-14).map(([date, val]) => {
  const dateStr = String(date);

  return (
    <div key={dateStr} className={styles.barGroup}>
      <div className={styles.barWrap}>
        <div
          className={styles.bar}
          style={{
            height: `${(val / maxRevenue) * 120}px`,
            background: "#e53935",
          }}
          title={formatCurrencyVND(val)}
        />
      </div>

      <div className={styles.barLabel}>
        {dateStr.slice(5, 10)}
      </div>
    </div>
  );
})}
            </div>
          )}
        </div>

        {/* ORDER STATUS */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>🧾 Trạng thái đơn hàng</h3>
          <div className={styles.statusList}>
            {orderStats.map(([status, count]) => (
              <div key={status} className={styles.statusRow}>
                <span className={styles.statusName}>{status}</span>
                <div className={styles.statusBarWrap}>
                  <div
                    className={styles.statusBar}
                    style={{
                      width: `${(Number(count) / Math.max(...orderStats.map(([, c]) => Number(c)), 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className={styles.statusCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP PRODUCTS */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>🏆 Top sản phẩm bán chạy</h3>
        <div className={styles.topList}>
          {topProducts.slice(0, 10).map(([name, sold], idx) => (
            <div key={name} className={styles.topItem}>
              <span className={styles.topRank} style={{ color: idx < 3 ? "#e53935" : "#aaa" }}>
                #{idx + 1}
              </span>
              <span className={styles.topName}>{name}</span>
              <div className={styles.topBarWrap}>
                <div
                  className={styles.topBar}
                  style={{ width: `${(Number(sold) / maxTop) * 100}%` }}
                />
              </div>
              <span className={styles.topSold}>{sold} đã bán</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
