import { create } from "zustand";

export interface Notification {
  id: number;
  orderId: number;
  message: string;
  read: boolean;
  createdAt: Date;
}

const STATUS_MESSAGE: Record<string, string> = {
  PENDING:    "🕐 Đơn hàng #{{id}} đang chờ xác nhận",
  CONFIRMED:  "✔️ Đơn hàng #{{id}} đã được xác nhận",
  PAID:       "💳 Đơn hàng #{{id}} đã thanh toán thành công",  // ← thêm
  PROCESSING: "📦 Đơn hàng #{{id}} đang được đóng gói",
  SHIPPED:    "🚚 Đơn hàng #{{id}} đang được giao",
  DELIVERED:  "📬 Đơn hàng #{{id}} đã giao đến tay bạn",
  COMPLETED:  "🎉 Đơn hàng #{{id}} hoàn tất",
  CANCELLED:  "❌ Đơn hàng #{{id}} đã bị huỷ",
  REFUNDED:   "💜 Đơn hàng #{{id}} đã được hoàn tiền",
  RETURNED:   "🔄 Yêu cầu trả hàng #{{id}} đã được ghi nhận",  // ← thêm
};

interface NotificationState {
  notifications: Notification[];
  addNotification: (orderId: number, status: string) => void;
  // ← MỚI: thêm thông báo kết quả thanh toán trực tiếp
  addPaymentNotification: (orderId: number, success: boolean, transactionId?: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (orderId, status) => {
    const template = STATUS_MESSAGE[status];
    if (!template) return;
    const message = template.replace("{{id}}", String(orderId));
    set((state) => ({
      notifications: [
        { id: Date.now(), orderId, message, read: false, createdAt: new Date() },
        ...state.notifications,
      ],
    }));
  },

  // ← MỚI: dùng cho /queue/payment websocket event
  addPaymentNotification: (orderId, success, transactionId) => {
    const message = success
      ? `💳 Thanh toán đơn #${orderId} thành công${transactionId ? ` (Mã GD: ${transactionId})` : ""}`
      : `❗ Thanh toán đơn #${orderId} thất bại, vui lòng thử lại`;
    set((state) => ({
      notifications: [
        { id: Date.now(), orderId, message, read: false, createdAt: new Date() },
        ...state.notifications,
      ],
    }));
  },

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearAll: () => set({ notifications: [] }),
}));