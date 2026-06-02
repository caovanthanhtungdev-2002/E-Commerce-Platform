// components/shipping/TrackingTimeline.tsx
import React from 'react';
import type { TrackingEvent } from '../../types/shippingTypes';
import { formatDateTime } from '@/utils/dateUtils';
import styles from './TrackingTimeline.module.css';


const STATUS_ICON: Record<string, string> = {
  ORDER_PLACED:        '🕐',
  PICKED_UP:           '📦',
  IN_TRANSIT:          '🚚',
  OUT_FOR_DELIVERY:    '🛵',
  DELIVERY_ATTEMPTED:  '🔔',
  DELIVERED:           '✅',
  RETURNED:            '↩️',
  CANCELLED:           '❌',
};

interface Props {
  events: TrackingEvent[];
}

export const TrackingTimeline: React.FC<Props> = ({ events }) => {
  if (!events.length) {
    return <p className={styles.empty}>Chưa có thông tin vận chuyển.</p>;
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
  );

  return (
    <ol className={styles.timeline}>
      {sorted.map((ev, idx) => (
        <li key={ev.id} className={`${styles.item} ${idx === 0 ? styles.latest : ''}`}>
          <span className={styles.icon}>{STATUS_ICON[ev.status] ?? '📍'}</span>
          <div className={styles.content}>
            <span className={styles.status}>{ev.status.replace(/_/g, ' ')}</span>
            <span className={styles.location}>{ev.location}</span>
            <p className={styles.desc}>{ev.description}</p>
            <time className={styles.time}>
              {formatDateTime(ev.eventTime)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
};