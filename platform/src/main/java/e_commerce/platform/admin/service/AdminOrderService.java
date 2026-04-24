package e_commerce.platform.admin.service;

import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminOrderService {

    List<Order> getOrders(int page, int size);

    Order getOrderById(Long orderId);

    List<Order> filterOrders(OrderStatus status, String username,
                             LocalDateTime from, LocalDateTime to);

    void updateOrderStatus(Long orderId, OrderStatus status);

    void cancelOrder(Long orderId, String reason);

    void refundOrder(Long orderId);

    void forceCompleteOrder(Long orderId);

    void deleteOrder(Long orderId);
}