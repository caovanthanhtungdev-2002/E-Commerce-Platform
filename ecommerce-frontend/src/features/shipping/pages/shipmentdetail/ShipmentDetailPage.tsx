// pages/ShipmentDetailPage.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShippingStore } from '../../store/shippingStore';
import { ShipmentDetailCard } from '../../components/shipmentdetail/ShipmentDetailCard';
import type { ShipmentStatus } from '../../types/shippingTypes';
import styles from './ShipmentDetailPage.module.css';


const NEXT_STATUS: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING:           ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:         ['PICKING_UP', 'CANCELLED'],
  PICKING_UP:        ['IN_TRANSIT'],
  IN_TRANSIT:        ['OUT_FOR_DELIVERY', 'FAILED_DELIVERY'],
  OUT_FOR_DELIVERY:  ['DELIVERED', 'FAILED_DELIVERY'],
  FAILED_DELIVERY:   ['RETURNED', 'OUT_FOR_DELIVERY'],
  DELIVERED:         [],
  RETURNED:          [],
  CANCELLED:         [],
};

const STATUS_LABEL: Record<ShipmentStatus, string> = {
  PENDING:           'Chờ xử lý',
  CONFIRMED:         'Xác nhận đơn',
  PICKING_UP:        'Bắt đầu lấy hàng',
  IN_TRANSIT:        'Đang vận chuyển',
  OUT_FOR_DELIVERY:  'Đang giao đến khách',
  DELIVERED:         'Đã giao thành công',
  FAILED_DELIVERY:   'Giao thất bại',
  RETURNED:          'Đã hoàn hàng',
  CANCELLED:         'Hủy đơn',
};

export const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentShipment, loading, updateShipmentStatus } = useShippingStore();

  const [note, setNote]         = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (status: ShipmentStatus) => {
    if (!id) return;
    setUpdating(true);
    await updateShipmentStatus(id, { status, note });
    setUpdating(false);
    setNote('');
  };

  const available = currentShipment
    ? NEXT_STATUS[currentShipment.status] ?? []
    : [];

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>← Quay lại</button>

      {id && <ShipmentDetailCard shipmentId={id} />}

      {available.length > 0 && (
        <div className={styles.actions}>
          <h4 className={styles.actTitle}>Cập nhật trạng thái</h4>
          <textarea
            className={styles.note}
            rows={2}
            placeholder="Ghi chú (tuỳ chọn)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className={styles.btnRow}>
            {available.map((s) => (
              <button
                key={s}
                className={`${styles.btn} ${styles[s.toLowerCase()]}`}
                disabled={updating || loading}
                onClick={() => handleUpdate(s)}
              >
                {updating ? 'Đang xử lý…' : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};