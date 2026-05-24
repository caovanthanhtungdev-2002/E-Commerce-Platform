package e_commerce.platform.admin.service;

import e_commerce.platform.admin.dto.response.AdminOrderResponse;
import e_commerce.platform.modules.order.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminOrderService {

    List<AdminOrderResponse> getOrders(int page, int size);

    AdminOrderResponse getOrderById(Long orderId);

    List<AdminOrderResponse> filterOrders(OrderStatus status, String username,
                                          LocalDateTime from, LocalDateTime to);

    void updateOrderStatus(Long orderId, OrderStatus status);

    void cancelOrder(Long orderId, String reason);

    void refundOrder(Long orderId);

    void forceCompleteOrder(Long orderId);

    void deleteOrder(Long orderId);

    void confirmOrder(Long orderId);
}