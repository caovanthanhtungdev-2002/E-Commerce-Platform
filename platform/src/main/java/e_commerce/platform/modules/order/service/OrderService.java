package e_commerce.platform.modules.order.service;

import e_commerce.platform.modules.order.dto.response.OrderResponse;

public interface OrderService {

    OrderResponse createOrder(String username);

    OrderResponse getOrder(Long id);
}