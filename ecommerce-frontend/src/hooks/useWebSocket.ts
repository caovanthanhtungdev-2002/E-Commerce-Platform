import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useNotificationStore } from "@/features/notification/store/notificationStore";

interface UseWebSocketOptions {
  username: string;
  onOrderUpdate?: (orderId: number) => void;
  onCartUpdate?: () => void;
  // ← MỚI
  onPaymentResult?: (orderId: number, success: boolean, transactionId?: string) => void;
  onShipmentUpdate?: (orderId: string, shipmentStatus: string) => void;
}

export function useWebSocket({
  username,
  onOrderUpdate,
  onCartUpdate,
  onPaymentResult,
  onShipmentUpdate,
}: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const { addNotification, addPaymentNotification } = useNotificationStore();

  useEffect(() => {
    if (!username) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("/ws"),
      reconnectDelay: 5000,

      onConnect: () => {
        // ── đơn hàng ──────────────────────────────────────────────
        client.subscribe(`/user/queue/orders`, (msg) => {
          const data = JSON.parse(msg.body);
          // data: { orderId, status, message, timestamp }
          addNotification(data.orderId, data.status);
          onOrderUpdate?.(data.orderId);
        });

        // ── giỏ hàng ──────────────────────────────────────────────
        client.subscribe(`/user/queue/cart`, (msg) => {
          const data = JSON.parse(msg.body);
          if (data.action === "REFRESH") {
            onCartUpdate?.();
          }
        });

        // ── thanh toán ← MỚI ──────────────────────────────────────
        client.subscribe(`/user/queue/payment`, (msg) => {
          const data = JSON.parse(msg.body);
          // data: { orderId, success, transactionId, message, timestamp }
          addPaymentNotification(data.orderId, data.success, data.transactionId);
          onPaymentResult?.(data.orderId, data.success, data.transactionId);
        });

        // ── vận chuyển ← MỚI ──────────────────────────────────────
        client.subscribe(`/user/queue/shipment`, (msg) => {
          const data = JSON.parse(msg.body);
          // data: { orderId, shipmentStatus, trackingNumber, message, timestamp }
          // Dùng addNotification với shipmentStatus để hiển thị thông báo
          addNotification(Number(data.orderId), data.shipmentStatus);
          onShipmentUpdate?.(data.orderId, data.shipmentStatus);
        });
      },

      onStompError: (frame) => {
        console.error("[WS] STOMP error", frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [username]);
}