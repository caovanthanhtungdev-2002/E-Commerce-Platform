// components/shipping/ShipmentStatusBadge.tsx
import React from 'react';
import type { ShipmentStatus, ReturnStatus } from '../../types/shippingTypes';
import styles from './Shipmentstatusbadge.module.css';

type AnyStatus = ShipmentStatus | ReturnStatus;

const CONFIG: Record<AnyStatus, { label: string; cls: string }> = {
  // ShipmentStatus — đầy đủ 9 trạng thái backend
  PENDING:           { label: 'Chờ xử lý',        cls: 'pending'   },
  CONFIRMED:         { label: 'Đã xác nhận',       cls: 'confirmed' },
  PICKING_UP:        { label: 'Đang lấy hàng',     cls: 'shipping'  },
  IN_TRANSIT:        { label: 'Đang vận chuyển',   cls: 'shipping'  },
  OUT_FOR_DELIVERY:  { label: 'Đang giao',          cls: 'shipping'  },
  DELIVERED:         { label: 'Đã giao',            cls: 'delivered' },
  FAILED_DELIVERY:   { label: 'Giao thất bại',      cls: 'failed'    },
  RETURNED:          { label: 'Đã hoàn hàng',       cls: 'returned'  },
  CANCELLED:         { label: 'Đã hủy',             cls: 'cancelled' },
  // ReturnStatus — đầy đủ 6 trạng thái backend
  APPROVED:          { label: 'Đã duyệt',           cls: 'confirmed' },
  REJECTED:          { label: 'Từ chối',            cls: 'failed'    },
  PROCESSING:        { label: 'Đang xử lý',         cls: 'shipping'  },
  COMPLETED:         { label: 'Hoàn thành',         cls: 'delivered' },
};

interface Props {
  status: AnyStatus;
}

export const ShipmentStatusBadge: React.FC<Props> = ({ status }) => {
  const { label, cls } = CONFIG[status] ?? { label: status, cls: 'pending' };
  return <span className={`${styles.badge} ${styles[cls]}`}>{label}</span>;
};