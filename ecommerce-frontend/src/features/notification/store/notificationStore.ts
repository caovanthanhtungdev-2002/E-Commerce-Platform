import { create } from "zustand";

export interface Notification {
  id: number;
  orderId: number;
  message: string;
  read: boolean;
  createdAt: Date;
}

const STATUS_MESSAGE: Record<string, string> = {
  CONFIRMED:  "✔️ Đơn hàng #{{id}} đã được xác nhận",
  PROCESSING: "📦 Đơn hàng #{{id}} đang được đóng gói",
  SHIPPED:    "🚚 Đơn hàng #{{id}} đang được giao",
  DELIVERED:  "📬 Đơn hàng #{{id}} đã giao đến tay bạn",
  COMPLETED:  "🎉 Đơn hàng #{{id}} hoàn tất",
  CANCELLED:  "❌ Đơn hàng #{{id}} đã bị huỷ",
  REFUNDED:   "💜 Đơn hàng #{{id}} đã được hoàn tiền",
};

interface NotificationState {
  notifications: Notification[];
  addNotification: (orderId: number, status: string) => void;
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
        {
          id: Date.now(),
          orderId,
          message,
          read: false,
          createdAt: new Date(),
        },
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