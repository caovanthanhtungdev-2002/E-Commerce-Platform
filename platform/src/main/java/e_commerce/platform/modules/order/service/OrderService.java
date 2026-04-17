package e_commerce.platform.modules.order.service;

import e_commerce.platform.modules.order.dto.request.CreateOrderRequest;
import e_commerce.platform.modules.order.dto.response.OrderResponse;

public interface OrderService {

    OrderResponse createOrder(String username, CreateOrderRequest request);

    OrderResponse getOrder(Long id);
}