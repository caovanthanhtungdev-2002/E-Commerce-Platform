import { useEffect, useRef, useState, useCallback } from "react";
import { adminDashboardService } from "@/features/admin/services/adminOtherServices";

const STORAGE_KEY = "admin_last_seen_pending_count";
const POLL_INTERVAL = 30_000; // 30 giây

export function useNewOrderNotification() {
  const [pendingCount, setPendingCount] = useState(0);
  const [newOrderCount, setNewOrderCount] = useState(0); // số đơn mới chưa xem
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPendingCount = useCallback(async () => {
    try {
      // Gọi getOrderStatusStats() trả về [string, number][] ví dụ: [["PENDING", 5], ["CONFIRMED", 3], ...]
      const stats = await adminDashboardService.getOrderStatusStats();
      const entry = stats.find(([status]) => status === "PENDING");
      const current = entry ? Number(entry[1]) : 0;

      setPendingCount(current);

      // So sánh với lần trước
      const lastSeen = Number(localStorage.getItem(STORAGE_KEY) ?? current);
      const diff = current - lastSeen;
      if (diff > 0) {
        setNewOrderCount(diff);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();
    intervalRef.current = setInterval(fetchPendingCount, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPendingCount]);

  // Gọi hàm này khi admin đã xem đơn hàng
  const markAsSeen = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, String(pendingCount));
    setNewOrderCount(0);
  }, [pendingCount]);

  return { pendingCount, newOrderCount, markAsSeen };
}