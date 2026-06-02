// components/shipping/ShipmentDetailCard.tsx
import { formatDateTime } from '@/utils/dateUtils';
import React, { useEffect } from 'react';
import { useShippingStore } from '../../store/shippingStore';
import { ShipmentStatusBadge } from '../shipmentstatus/ShipmentStatusBadge';
import { TrackingTimeline } from '../shipmenttimeline/TrackingTimeline';
import styles from './ShipmentDetailCard.module.css';

interface Props {
  shipmentId: string;
}

export const ShipmentDetailCard: React.FC<Props> = ({ shipmentId }) => {
  const { currentShipment, trackingEvents, loading, fetchShipment, fetchTrackingEvents } =
    useShippingStore();

  useEffect(() => {
    fetchShipment(shipmentId);
    fetchTrackingEvents(shipmentId);
  }, [shipmentId]);

  if (loading && !currentShipment) {
    return <div className={styles.skeleton} aria-busy="true" />;
  }

  if (!currentShipment) return null;

  const s = currentShipment;
  const addr = s.shippingAddress;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Đơn vận chuyển</h3>
          <p className={styles.sub}>Mã đơn hàng: <strong>#{s.orderId}</strong></p>
        </div>
        <ShipmentStatusBadge status={s.status} />
      </div>

      {/* Meta */}
      <div className={styles.meta}>
        <Row label="Đơn vị vận chuyển" value={s.carrier} />
        <Row
          label="Mã vận đơn"
          value={
            <span className={styles.tracking}>{s.trackingNumber}</span>
          }
        />
        <Row label="Phí vận chuyển" value={formatVND(s.shippingFee)} />
        {s.deliveredAt && (
          <Row
            label="Ngày giao"
            value={formatDateTime(s.deliveredAt)}
          />
        )}
        {s.note && <Row label="Ghi chú" value={s.note} />}
      </div>

      {/* Address */}
      {addr && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Địa chỉ giao hàng</h4>
          <p className={styles.addrName}>{addr.receiverName}</p>
          <p className={styles.addrLine}>{addr.receiverPhone}</p>
          <p className={styles.addrLine}>
            {addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}
          </p>
          {addr.note && <p className={styles.addrNote}>{addr.note}</p>}
        </div>
      )}

      {/* Tracking */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Lịch sử vận chuyển</h4>
        <TrackingTimeline events={trackingEvents} />
      </div>
    </div>
  );
};

// --- helpers ---

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className={styles.row}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value}>{value}</span>
  </div>
);

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
