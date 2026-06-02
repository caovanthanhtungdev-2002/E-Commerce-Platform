// pages/ReturnListPage.tsx
import React, { useEffect, useState } from 'react';
import { useShippingStore } from '../../store/shippingStore';
import { ShipmentStatusBadge } from '../../components/shipmentstatus/ShipmentStatusBadge';
import type { ReturnStatus } from '../../types/shippingTypes';
import { formatDate } from '@/utils/dateUtils';
import styles from './ReturnListPage.module.css';

const PAGE_SIZE = 15;

export const ReturnListPage: React.FC = () => {
  const { returns, loading, error, fetchReturns, updateReturnStatus, clearError } =
    useShippingStore();

  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = (s = status, p = page) =>
    fetchReturns({ page: p, size: PAGE_SIZE, status: s || undefined });

  useEffect(() => { load(); }, []);

  const handleAction = async (
    id: string,
    action: 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'
  ) => {
    setUpdating(id);
    await updateReturnStatus(id, action);
    setUpdating(null);
  };

  const totalPages = returns?.totalPages ?? 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Quản lý hoàn hàng</h1>

      <div className={styles.filters}>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); load(e.target.value, 0); }}
        >
          {[
            { value: '',            label: 'Tất cả'    },
    { value: 'PENDING',     label: 'Chờ duyệt' },  
    { value: 'APPROVED',    label: 'Đã duyệt'  },
    { value: 'REJECTED',    label: 'Từ chối'   },
    { value: 'PROCESSING',  label: 'Đang xử lý' }, 
    { value: 'COMPLETED',   label: 'Hoàn thành' },
    { value: 'CANCELLED',   label: 'Đã hủy'    },
          ].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {error && (
        <div className={styles.error}>{error} <button onClick={clearError}>✕</button></div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Lý do</th>
              <th>Hoàn tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && !returns && (
              <tr><td colSpan={6} className={styles.center}>Đang tải…</td></tr>
            )}
            {!loading && returns?.content.length === 0 && (
              <tr><td colSpan={6} className={styles.center}>Không có yêu cầu nào.</td></tr>
            )}
            {returns?.content.map((r) => (
              <tr key={r.id} className={styles.row}>
                <td>#{r.orderId.slice(-8)}</td>
                <td className={styles.reason}>{r.reason}</td>
                <td>{fmt(r.refundAmount)}</td>
                <td><ShipmentStatusBadge status={r.status as ReturnStatus} /></td>
                <td>{formatDate(r.createdAt)}</td>
                <td>
                  <div className={styles.actionBtns}>
                    
{r.status === 'PENDING' && (   
  <>
    <button
      className={`${styles.actionBtn} ${styles.approve}`}
      disabled={updating === r.id}
      onClick={() => handleAction(r.id, 'APPROVED')}
    >Duyệt</button>
    <button
      className={`${styles.actionBtn} ${styles.reject}`}
      disabled={updating === r.id}
      onClick={() => handleAction(r.id, 'REJECTED')}
    >Từ chối</button>
  </>
)}
                    {r.status === 'APPROVED' && (
                      <button
                        className={`${styles.actionBtn} ${styles.complete}`}
                        disabled={updating === r.id}
                        onClick={() => handleAction(r.id, 'COMPLETED')}
                      >Hoàn thành</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 0} onClick={() => { setPage(page - 1); load(status, page - 1); }}>← Trước</button>
          <span>{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => { setPage(page + 1); load(status, page + 1); }}>Sau →</button>
        </div>
      )}
    </div>
  );
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
