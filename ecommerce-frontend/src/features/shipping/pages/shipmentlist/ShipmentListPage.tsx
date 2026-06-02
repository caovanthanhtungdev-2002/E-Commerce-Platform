import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShippingStore } from '../../store/shippingStore';
import { ShipmentStatusBadge } from '../../components/shipmentstatus/ShipmentStatusBadge';
import type { ShipmentStatus } from '../../types/shippingTypes';
import { formatDate } from '@/utils/dateUtils';
import styles from './ShipmentListPage.module.css';

const STATUS_OPTIONS = [
  { value: '',                 label: 'Tất cả'          },
  { value: 'PENDING',          label: 'Chờ xử lý'       },
  { value: 'CONFIRMED',        label: 'Đã xác nhận'     },
  { value: 'PICKING_UP',       label: 'Đang lấy hàng'   },
  { value: 'IN_TRANSIT',       label: 'Đang vận chuyển' },
  { value: 'OUT_FOR_DELIVERY', label: 'Đang giao'       },
  { value: 'DELIVERED',        label: 'Đã giao'         },
  { value: 'FAILED_DELIVERY',  label: 'Giao thất bại'   },
  { value: 'RETURNED',         label: 'Đã hoàn'         },
  { value: 'CANCELLED',        label: 'Đã hủy'          },
];

const PAGE_SIZE = 15;

export const ShipmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { shipments, loading, error, fetchShipments, clearError } = useShippingStore();

  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(0);

  useEffect(() => {
    const fromOrder = searchParams.get("search");
    if (fromOrder) {
      setSearch(fromOrder);
      fetchShipments({ page: 0, size: PAGE_SIZE, search: fromOrder });
    } else {
      fetchShipments({ page: 0, size: PAGE_SIZE });
    }
  }, []);

  const load = (s = status, q = search, p = page) => {
    fetchShipments({
      page: p,
      size: PAGE_SIZE,
      status: (s as ShipmentStatus) || undefined,
      search: q || undefined,
    });
  };

  const handleFilter = () => { setPage(0); load(status, search, 0); };

  const handlePageChange = (p: number) => { setPage(p); load(status, search, p); };

  const totalPages = shipments?.totalPages ?? 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Quản lý vận chuyển</h1>

      <div className={styles.filters}>
        <input
          className={styles.search}
          placeholder="Tìm mã vận đơn, mã đơn hàng…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
        />
        <select
          className={styles.select}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
            load(e.target.value, search, 0);
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button className={styles.btnSearch} onClick={handleFilter}>Tìm kiếm</button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={clearError}>✕</button>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Mã vận đơn</th>
              <th>Đơn vị VC</th>
              <th>Phí VC</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && !shipments && (
              <tr><td colSpan={7} className={styles.center}>Đang tải…</td></tr>
            )}
            {!loading && shipments?.content.length === 0 && (
              <tr><td colSpan={7} className={styles.center}>Không có đơn nào.</td></tr>
            )}
            {shipments?.content.map((s) => (
              <tr key={s.id} className={styles.row}>
                <td>
                  <span className={styles.orderId}>#{s.orderId.slice(-8)}</span>
                </td>
                <td><code className={styles.code}>{s.trackingNumber}</code></td>
                <td>{s.carrier}</td>
                <td>{fmt(s.shippingFee)}</td>
                <td><ShipmentStatusBadge status={s.status} /></td>
                <td>{formatDate(s.createdAt)}</td>
                <td>
                  <button
                    className={styles.btnView}
                    onClick={() => navigate(`/admin/shipments/${s.id}`)}
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 0} onClick={() => handlePageChange(page - 1)}>
            ← Trước
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => handlePageChange(page + 1)}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);