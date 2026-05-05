package e_commerce.platform.modules.order.service;

import e_commerce.platform.modules.order.dto.request.CreateOrderRequest;
import e_commerce.platform.modules.order.dto.response.OrderResponse;
import e_commerce.platform.modules.order.entity.Order;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(String username, CreateOrderRequest request);

    OrderResponse getOrder(Long id);

    List<Order> getOrdersByUser(String username);
}