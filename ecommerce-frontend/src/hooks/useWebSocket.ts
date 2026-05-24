import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

interface Options {
    username: string;
    onOrderUpdate: (orderId: number, status: string) => void;
    onCartUpdate: () => void;
}

export function useWebSocket({ username, onOrderUpdate, onCartUpdate }: Options) {
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        console.log("🔌 useWebSocket username:", username);
        if (!username) return;

        const client = new Client({
            brokerURL: "ws://localhost:8080/ws/websocket",
            reconnectDelay: 5000,
            onConnect: () => {
                console.log(" WebSocket connected"); 

                client.subscribe(`/topic/orders/${username}`, (msg) => {
                    console.log("📦 Order update:", msg.body); 
                    const { orderId, status } = JSON.parse(msg.body);
                    onOrderUpdate(orderId, status);
                });

                client.subscribe(`/topic/cart/${username}`, () => {
                    console.log("🛒 Cart update received"); 
                    onCartUpdate();
                });
            },
            onDisconnect: () => {
                console.log("❌ WebSocket disconnected"); 
            },
            onStompError: (frame) => {
                console.error("STOMP error:", frame); 
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [username]);
}