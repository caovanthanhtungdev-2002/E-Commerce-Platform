import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useNotificationStore } from "@/features/notification/store/notificationStore";
import { useToast } from "@/components/Toast";
import { useAuthStore } from "@/features/auth/store/authStore";

interface UseWebSocketOptions {
  onOrderUpdate?: (orderId: number, status: string) => void;
  onCartUpdate?: () => void;
  onPaymentResult?: (orderId: number, success: boolean, transactionId?: string) => void;
  onShipmentUpdate?: (orderId: string, shipmentStatus: string) => void;
}

// ← singleton ngoài component, không bị StrictMode reset
let globalClient: Client | null = null;
let globalUsername = "";

export function useWebSocket({
  onOrderUpdate,
  onCartUpdate,
  onPaymentResult,
  onShipmentUpdate,
}: UseWebSocketOptions) {
  const { addNotification, addPaymentNotification } = useNotificationStore();
  const { showToast } = useToast();

  const username = useAuthStore((s) => s.user?.username ?? "");
  const accessToken = useAuthStore((s) => s.accessToken);

  const showToastRef = useRef(showToast);
  const onOrderUpdateRef = useRef(onOrderUpdate);
  const onCartUpdateRef = useRef(onCartUpdate);
  const onPaymentResultRef = useRef(onPaymentResult);
  const onShipmentUpdateRef = useRef(onShipmentUpdate);
  const addNotificationRef = useRef(addNotification);
  const addPaymentNotificationRef = useRef(addPaymentNotification);

  useEffect(() => { showToastRef.current = showToast; }, [showToast]);
  useEffect(() => { onOrderUpdateRef.current = onOrderUpdate; }, [onOrderUpdate]);
  useEffect(() => { onCartUpdateRef.current = onCartUpdate; }, [onCartUpdate]);
  useEffect(() => { onPaymentResultRef.current = onPaymentResult; }, [onPaymentResult]);
  useEffect(() => { onShipmentUpdateRef.current = onShipmentUpdate; }, [onShipmentUpdate]);
  useEffect(() => { addNotificationRef.current = addNotification; }, [addNotification]);
  useEffect(() => { addPaymentNotificationRef.current = addPaymentNotification; }, [addPaymentNotification]);

  useEffect(() => {
    if (!username || !accessToken) {
      // Logout → disconnect
      if (globalClient?.active) {
        globalClient.deactivate();
        globalClient = null;
        globalUsername = "";
      }
      return;
    }

    // ← đã connect với đúng username rồi → không làm gì
    if (globalClient?.active && globalUsername === username) return;

    // Username khác (switch account) → disconnect cũ trước
    if (globalClient?.active) {
      globalClient.deactivate();
      globalClient = null;
    }

    globalUsername = username;

    const client = new Client({
      webSocketFactory: () => new SockJS("/ws"),
      reconnectDelay: 5000,
      connectHeaders: { Authorization: `Bearer ${accessToken}` },

      onConnect: () => {
        console.log("[WS] ✅ Connected:", username);

        client.subscribe(`/user/queue/orders`, (msg) => {
          const data = JSON.parse(msg.body);
          console.log("[WS] 📦 Order:", data);
          addNotificationRef.current(data.orderId, data.status);
          showToastRef.current(data.message, "info");
          onOrderUpdateRef.current?.(data.orderId, data.status);
        });

        client.subscribe(`/user/queue/cart`, (msg) => {
          const data = JSON.parse(msg.body);
          if (data.action === "REFRESH") onCartUpdateRef.current?.();
        });

        client.subscribe(`/user/queue/payment`, (msg) => {
          const data = JSON.parse(msg.body);
          console.log("[WS] 💳 Payment:", data);
          addPaymentNotificationRef.current(data.orderId, data.success, data.transactionId);
          showToastRef.current(data.message, data.success ? "success" : "error");
          onPaymentResultRef.current?.(data.orderId, data.success, data.transactionId);
        });

        client.subscribe(`/user/queue/shipment`, (msg) => {
          const data = JSON.parse(msg.body);
          console.log("[WS] 🚚 Shipment:", data);
          addNotificationRef.current(Number(data.orderId), data.shipmentStatus);
          showToastRef.current(data.message, "info");
          onShipmentUpdateRef.current?.(data.orderId, data.shipmentStatus);
        });
      },

      onStompError: (frame) => console.error("[WS] ❌ STOMP Error", frame),
      onDisconnect: () => console.log("[WS] 🔴 Disconnected"),
    });

    client.activate();
    globalClient = client;

    // ← StrictMode cleanup không deactivate nữa, singleton tự quản lý
  }, [username, accessToken]);
}