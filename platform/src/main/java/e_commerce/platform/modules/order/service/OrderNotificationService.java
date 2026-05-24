package e_commerce.platform.modules.order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyOrderUpdated(String username, Long orderId, String status) {
        System.out.println("🔔 Sending order update to: /topic/orders/" + username); 
        messagingTemplate.convertAndSend(
            "/topic/orders/" + username,
            Map.of("orderId", orderId, "status", status)
        );
    }

    public void notifyCartUpdated(String username) {
        System.out.println("🛒 Sending cart update to: /topic/cart/" + username);
        messagingTemplate.convertAndSend(
            "/topic/cart/" + username,
            Map.of("action", "REFRESH")
        );
    }
}