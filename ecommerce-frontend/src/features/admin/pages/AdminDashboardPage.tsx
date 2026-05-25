import { useEffect, useRef, useState } from "react";
import { adminDashboardService } from "../services/adminOtherServices";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import type { DashboardSummary, CodReport } from "../types/adminTypes";
import { useNewOrderNotification } from "@/hooks/useNewOrderNotification";
import styles from "./AdminDashboardPage.module.css";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenue, setRevenue] = useState<[string, number][]>([]);
  const [topProducts, setTopProducts] = useState<[string, number][]>([]);
  const [orderStats, setOrderStats] = useState<[string, number][]>([]);
  const [codReport, setCodReport] = useState<CodReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { pendingCount, newOrderCount, markAsSeen } = useNewOrderNotification();

  useEffect(() => {
    if (newOrderCount > 0) {
      setToast(`🛎️ Có ${newOrderCount} đơn hàng mới đang chờ xử lý!`);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 5000);
    }
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, [newOrderCount]);

  useEffect(() => {
    Promise.all([
      adminDashboardService.getSummary(),
      adminDashboardService.getRevenue(),
      adminDashboardService.getTopProducts(),
      adminDashboardService.getOrderStatusStats(),
      adminDashboardService.getCodReport(),
    ]).then(([s, r, tp, os, cod]) => {
      setSummary(s);
      setRevenue(r);
      setTopProducts(tp);
      setOrderStats(os);
      setCodReport(cod);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  const STAT_CARDS = [
    { label: "Doanh thu", value: formatCurrencyVND(summary?.revenue || 0), icon: "💰", color: "#e53935" },
    { label: "Đơn hàng",  value: summary?.orders   || 0, icon: "🧾", color: "#1976d2", pendingCount, newOrderCount },
    { label: "Người dùng", value: summary?.users    || 0, icon: "👥", color: "#388e3c" },
    { label: "Sản phẩm",   value: summary?.products || 0, icon: "📦", color: "#f57c00" },
  ];

  const maxRevenue = Math.max(...revenue.map(([, v]) => v), 1);
  const maxTop     = Math.max(...topProducts.map(([, v]) => v), 1);
  const maxCod     = Math.max(...(codReport?.byDay?.map(([, v]) => v) ?? [1]), 1);
  const maxOrder   = Math.max(...orderStats.map(([, c]) => Number(c)), 1);

  return (
    <div className={styles.page}>
      {/* TOAST */}
      {toast && (
        <div className={styles.toast}>
          {toast}
          <button className={styles.toastClose} onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <span className={styles.subtitle}>Tổng quan hệ thống</span>
      </div>

      {/* STAT CARDS */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((c) => (
          <div
            key={c.label}
            className={styles.statCard}
            onClick={() => {
              if (c.label === "Đơn hàng" && (c.newOrderCount ?? 0) > 0) markAsSeen();
            }}
          >
            <div
              className={styles.statIcon}
              style={{ background: c.color + "18", color: c.color, position: "relative" }}
            >
              {c.icon}
              {c.label === "Đơn hàng" && (c.newOrderCount ?? 0) > 0 && (
                <span className={styles.orderBadgeNew}>+{c.newOrderCount}</span>
              )}
            </div>

            <div>
              <div className={styles.statValue}>{c.value}</div>
              <div className={styles.statLabel}>
                {c.label}
                {c.label === "Đơn hàng" && (c.pendingCount ?? 0) > 0 && (
                  <span className={styles.orderBadgePending}>{c.pendingCount} chờ duyệt</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* COD REPORT CARDS */}
      <div className={styles.header} style={{ marginTop: "24px", marginBottom: "8px" }}>
        <h2 className={styles.title} style={{ fontSize: "18px" }}>💵 Báo cáo thu tiền COD</h2>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#ff980018", color: "#f57c00" }}>💵</div>
          <div>
            <div className={styles.statValue}>{formatCurrencyVND(codReport?.collected || 0)}</div>
            <div className={styles.statLabel}>Tổng tiền COD đã thu</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#43a04718", color: "#388e3c" }}>✅</div>
          <div>
            <div className={styles.statValue}>{codReport?.orders || 0}</div>
            <div className={styles.statLabel}>Đơn COD hoàn tất</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#1976d218", color: "#1976d2" }}>📊</div>
          <div>
            <div className={styles.statValue}>
              {codReport?.orders
                ? formatCurrencyVND((codReport.collected || 0) / codReport.orders)
                : "—"}
            </div>
            <div className={styles.statLabel}>Trung bình mỗi đơn COD</div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>📈 Doanh thu theo ngày</h3>
          {revenue.length === 0 ? (
            <div className={styles.empty}>Chưa có dữ liệu</div>
          ) : (
            <div className={styles.barChart}>
              {revenue.slice(-14).map(([date, val]) => {
                const d = String(date);
                return (
                  <div key={d} className={styles.barGroup}>
                    <div className={styles.barWrap}>
                      <div
                        className={styles.bar}
                        style={{ height: `${(val / maxRevenue) * 120}px`, background: "#e53935" }}
                        title={formatCurrencyVND(val)}
                      />
                    </div>
                    <div className={styles.barLabel}>{d.slice(5, 10)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>💵 Thu tiền COD theo ngày</h3>
          {!codReport?.byDay || codReport.byDay.length === 0 ? (
            <div className={styles.empty}>Chưa có dữ liệu</div>
          ) : (
            <div className={styles.barChart}>
              {codReport.byDay.slice(-14).map(([date, val]) => {
                const d = String(date);
                return (
                  <div key={d} className={styles.barGroup}>
                    <div className={styles.barWrap}>
                      <div
                        className={styles.bar}
                        style={{ height: `${(val / maxCod) * 120}px`, background: "#f57c00" }}
                        title={formatCurrencyVND(val)}
                      />
                    </div>
                    <div className={styles.barLabel}>{d.slice(5, 10)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>🧾 Trạng thái đơn hàng</h3>
          <div className={styles.statusList}>
            {orderStats.map(([status, count]) => (
              <div key={status} className={styles.statusRow}>
                <span className={styles.statusName}>
                  {status}
                  {status === "PENDING" && Number(count) > 0 && (
                    <span className={styles.statusBadge}>{count}</span>
                  )}
                </span>
                <div className={styles.statusBarWrap}>
                  <div
                    className={styles.statusBar}
                    style={{ width: `${(Number(count) / maxOrder) * 100}%` }}
                  />
                </div>
                <span className={styles.statusCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>

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
                  <div className={styles.topBar} style={{ width: `${(Number(sold) / maxTop) * 100}%` }} />
                </div>
                <span className={styles.topSold}>{sold} đã bán</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}