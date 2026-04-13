package e_commerce.platform.modules.order.service.impl;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.cart.dto.response.CartResponse;
import e_commerce.platform.modules.cart.service.CartService;
import e_commerce.platform.modules.inventory.service.InventoryService;
import e_commerce.platform.modules.order.dto.response.*;
import e_commerce.platform.modules.order.entity.*;
import e_commerce.platform.modules.order.enums.OrderStatus;
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
    private final InventoryService inventoryService;

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

        List<OrderItem> items = cart.getItems().stream().map(i -> {

            //confirm stock (QUAN TRỌNG)
            inventoryService.confirmOrder(i.getProductId(), i.getQuantity());

            return OrderItem.builder()
                    .productId(i.getProductId())
                    .productName(i.getProductName())
                    .price(i.getPrice())
                    .quantity(i.getQuantity())
                    .order(order)
                    .build();

        }).toList();

        order.setItems(items);

        orderRepository.save(order);

        //clear cart sau khi order thành công
        cartService.clearCart(username);

        return mapToResponse(order);
    }

    // ================= GET ORDER =================
    @Override
    public OrderResponse getOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return mapToResponse(order);
    }

    // ================= MAPPER =================
    private OrderResponse mapToResponse(Order order) {

        return OrderResponse.builder()
                .id(order.getId())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus().name())
                .items(order.getItems().stream().map(i ->
                        OrderItemResponse.builder()
                                .productId(i.getProductId())
                                .productName(i.getProductName())
                                .price(i.getPrice())
                                .quantity(i.getQuantity())
                                .build()
                ).toList())
                .build();
    }
}