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
  PAID:       "💳 Đơn hàng #{{id}} đã thanh toán thành công",
  PROCESSING: "📦 Đơn hàng #{{id}} đang được đóng gói",
  SHIPPED:    "🚚 Đơn hàng #{{id}} đang được giao",
  DELIVERED:  "📬 Đơn hàng #{{id}} đã giao đến tay bạn",
  COMPLETED:  "🎉 Đơn hàng #{{id}} hoàn tất",
  CANCELLED:  "❌ Đơn hàng #{{id}} đã bị huỷ",
  REFUNDED:   "💜 Đơn hàng #{{id}} đã được hoàn tiền",
  RETURNED:   "🔄 Yêu cầu trả hàng #{{id}} đã được ghi nhận",
};

interface NotificationState {
  notifications: Notification[];
  lastUpdatedOrderId: number | null;
  addNotification: (orderId: number, status: string) => void;
  addPaymentNotification: (orderId: number, success: boolean, transactionId?: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  lastUpdatedOrderId: null,

  addNotification: (orderId, status) => {
    const template = STATUS_MESSAGE[status];
    if (!template) return;
    const message = template.replace("{{id}}", String(orderId));
    const id = Date.now();

    set((state) => ({
      lastUpdatedOrderId: orderId,
      notifications: [
        { id, orderId, message, read: false, createdAt: new Date() },
        ...state.notifications,
      ],
    }));

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 15000);
  },

  addPaymentNotification: (orderId, success, transactionId) => {
    const message = success
      ? `💳 Thanh toán đơn #${orderId} thành công${transactionId ? ` (Mã GD: ${transactionId})` : ""}`
      : `❗ Thanh toán đơn #${orderId} thất bại, vui lòng thử lại`;
    const id = Date.now();

    set((state) => ({
      lastUpdatedOrderId: orderId,
      notifications: [
        { id, orderId, message, read: false, createdAt: new Date() },
        ...state.notifications,
      ],
    }));

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 10000);
  },

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearAll: () => set({ notifications: [] }),
}));