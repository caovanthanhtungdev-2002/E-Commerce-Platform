package e_commerce.platform.modules.order.service.impl;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.cart.dto.response.CartResponse;
import e_commerce.platform.modules.cart.service.CartService;
import e_commerce.platform.modules.order.dto.response.OrderResponse;
import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.entity.OrderItem;
import e_commerce.platform.modules.order.enums.OrderStatus;
import e_commerce.platform.modules.order.event.OrderEvent;
import e_commerce.platform.modules.order.mapper.OrderMapper;
import e_commerce.platform.modules.order.producer.OrderProducer;
import e_commerce.platform.modules.order.repository.OrderRepository;
import e_commerce.platform.modules.order.service.OrderService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final OrderProducer orderProducer;

    // ================= CREATE ORDER =================
    @Override
    @Transactional
    public OrderResponse createOrder(String username) {

        CartResponse cart = cartService.getCart(username);

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Order order = Order.builder()
                .username(username)
                .totalPrice(cart.getTotalPrice())
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        List<OrderItem> items = cart.getItems().stream().map(i ->
                OrderItem.builder()
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .price(i.getPrice())
                        .quantity(i.getQuantity())
                        .order(order)
                        .build()
        ).toList();

        order.setItems(items);
        orderRepository.save(order);

        // gửi event sang PAYMENT (KHÔNG gọi inventory ở đây)
        items.forEach(i -> {
            orderProducer.sendOrderCreated(
                    OrderEvent.builder()
                            .orderId(order.getId())
                            .productId(i.getProductId())
                            .quantity(i.getQuantity())
                            .status("CREATED")
                            .build()
            );
        });

        // clear cart
        cartService.clearCart(username);

        return OrderMapper.toResponse(order);
    }

    // ================= GET ORDER =================
    @Override
    public OrderResponse getOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return OrderMapper.toResponse(order);
    }
}