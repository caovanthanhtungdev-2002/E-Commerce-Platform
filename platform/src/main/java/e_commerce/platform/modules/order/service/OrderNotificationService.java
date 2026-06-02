package e_commerce.platform.modules.order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi thông báo cập nhật trạng thái đơn hàng đến đúng user.
     * Frontend subscribe: /user/queue/orders
     */
    public void notifyOrderUpdated(String username, Long orderId, String status) {
        messagingTemplate.convertAndSendToUser(
            username,
            "/queue/orders",
            Map.of(
                "orderId",   orderId,
                "status",    status,
                "message",   buildMessage(status),
                "timestamp", LocalDateTime.now().toString()
            )
        );
    }

    /**
     * Yêu cầu frontend refresh giỏ hàng.
     */
    public void notifyCartUpdated(String username) {
        messagingTemplate.convertAndSendToUser(
            username,
            "/queue/cart",
            Map.of("action", "REFRESH", "timestamp", LocalDateTime.now().toString())
        );
    }

    /**
     * Thông báo thanh toán thành công / thất bại.
     */
    public void notifyPaymentResult(String username, Long orderId,
                                    boolean success, String transactionId) {
        messagingTemplate.convertAndSendToUser(
            username,
            "/queue/payment",
            Map.of(
                "orderId",       orderId,
                "success",       success,
                "transactionId", transactionId != null ? transactionId : "",
                "message",       success ? "Thanh toán thành công!" : "Thanh toán thất bại, vui lòng thử lại",
                "timestamp",     LocalDateTime.now().toString()
            )
        );
    }

    /**
     * Thông báo shipment cập nhật (tracking).
     */
    public void notifyShipmentUpdated(String username, String orderId,
                                       String shipmentStatus, String trackingNumber) {
        messagingTemplate.convertAndSendToUser(
            username,
            "/queue/shipment",
            Map.of(
                "orderId",        orderId,
                "shipmentStatus", shipmentStatus,
                "trackingNumber", trackingNumber,
                "message",        buildShipmentMessage(shipmentStatus),
                "timestamp",      LocalDateTime.now().toString()
            )
        );
    }

    // ---- helpers ----

    private String buildMessage(String status) {
        return switch (status) {
            case "CONFIRMED"   -> "Đơn hàng đã được xác nhận!";
            case "PROCESSING"  -> "Đơn hàng đang được đóng gói.";
            case "SHIPPED"     -> "Đơn hàng đã được giao cho đơn vị vận chuyển.";
            case "DELIVERED"   -> "Đơn hàng đã giao thành công!";
            case "COMPLETED"   -> "Cảm ơn bạn đã mua hàng!";
            case "CANCELLED"   -> "Đơn hàng đã bị huỷ.";
            case "RETURNED"    -> "Yêu cầu trả hàng đã được ghi nhận.";
            default            -> "Trạng thái đơn hàng đã cập nhật: " + status;
        };
    }

    private String buildShipmentMessage(String status) {
        return switch (status) {
            case "PICKING_UP"       -> "Shipper đang đến lấy hàng.";
            case "IN_TRANSIT"       -> "Hàng đang trên đường vận chuyển.";
            case "OUT_FOR_DELIVERY" -> "Shipper đang giao hàng đến bạn!";
            case "DELIVERED"        -> "Giao hàng thành công!";
            case "FAILED_DELIVERY"  -> "Giao hàng thất bại, sẽ thử lại.";
            case "RETURNED"         -> "Hàng đang được hoàn trả.";
            default                 -> "Trạng thái vận chuyển: " + status;
        };
    }
}