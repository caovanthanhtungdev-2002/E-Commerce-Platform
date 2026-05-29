package e_commerce.platform.modules.order.service.impl;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.cart.dto.response.CartItemResponse;
import e_commerce.platform.modules.cart.dto.response.CartResponse;
import e_commerce.platform.modules.cart.service.CartService;
import e_commerce.platform.modules.coupon.dto.request.ApplyCouponRequest;
import e_commerce.platform.modules.coupon.dto.response.CouponResponse;
import e_commerce.platform.modules.coupon.service.CouponService;
import e_commerce.platform.modules.inventory.service.InventoryService;
import e_commerce.platform.modules.order.dto.request.CreateOrderRequest;
import e_commerce.platform.modules.order.dto.response.OrderResponse;
import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.entity.OrderItem;
import e_commerce.platform.modules.order.enums.OrderStatus;
import e_commerce.platform.modules.order.event.OrderEvent;
import e_commerce.platform.modules.order.mapper.OrderMapper;
import e_commerce.platform.modules.order.producer.OrderProducer;
import e_commerce.platform.modules.order.repository.OrderRepository;
import e_commerce.platform.modules.order.service.OrderNotificationService;
import e_commerce.platform.modules.order.service.OrderService;
import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import e_commerce.platform.modules.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final OrderProducer orderProducer;
    private final CouponService couponService;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final OrderNotificationService orderNotificationService; 
    private final UserRepository userRepository;

    // =========================================================
    // TẠO ĐƠN HÀNG
    // =========================================================
    @Override
    @Transactional
    public OrderResponse createOrder(String username, CreateOrderRequest request) {

        List<CartItemResponse> selectedItems;

       
Long userId = userRepository.findByUsername(username)
        .orElseThrow(() -> new BadRequestException("User not found"))
        .getId();

        boolean isBuyNow = request.getBuyNowItems() != null
                && !request.getBuyNowItems().isEmpty();

        if (isBuyNow) {
            selectedItems = request.getBuyNowItems().stream().map(item -> {
                Product product = productRepository.findById(item.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

                return CartItemResponse.builder()
                        .productId(product.getId())
                        .productName(product.getName())
                        .price(product.getPrice())
                        .quantity(item.getQuantity())
                        .imageUrl(product.getImageUrl())
                        .build();
            }).toList();
        } else {
            CartResponse cart = cartService.getCart(username);

            if (cart.getItems().isEmpty()) {
                throw new BadRequestException("Cart is empty");
            }

            if (request.getSelectedProductIds() != null
                    && !request.getSelectedProductIds().isEmpty()) {
                selectedItems = cart.getItems().stream()
                        .filter(i -> request.getSelectedProductIds().contains(i.getProductId()))
                        .toList();
            } else {
                selectedItems = cart.getItems();
            }

            if (selectedItems.isEmpty()) {
                throw new BadRequestException("No selected items");
            }
        }

        double totalPrice = selectedItems.stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        double discount = 0;
        String couponCode = null;

        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            ApplyCouponRequest couponRequest = new ApplyCouponRequest();
            couponRequest.setCode(request.getCouponCode());
            couponRequest.setOrderAmount(totalPrice);

            CouponResponse couponResponse = couponService.applyCoupon(couponRequest);
            discount = couponResponse.getDiscount();
            couponCode = couponResponse.getCode();
        }

        double finalPrice = Math.max(0, totalPrice - discount);

        List<OrderItem> items = selectedItems.stream().map(i -> {
            Product product = productRepository.findById(i.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            return OrderItem.builder()
                    .product(product)
                    .productName(i.getProductName())
                    .price(i.getPrice())
                    .quantity(i.getQuantity())
                    .totalPrice(i.getPrice() * i.getQuantity())
                    .imageUrl(i.getImageUrl())
                    .build();
        }).toList();

        items.forEach(i -> inventoryService.reserveStock(
                i.getProduct().getId(),
                i.getQuantity()
        ));

        Order order = Order.builder()
                .userId(userId)
                .username(username)
                .totalPrice(totalPrice)
                .discount(discount)
                .finalPrice(finalPrice)
                .couponCode(couponCode)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .receiverName(request.getReceiverName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .paymentMethod(request.getPaymentMethod())
                .build();

        items.forEach(i -> i.setOrder(order));
        order.setItems(items);
        orderRepository.save(order);

        items.forEach(i -> orderProducer.sendOrderCreated(
                OrderEvent.builder()
                        .orderId(order.getId())
                        .productId(i.getProduct().getId())
                        .quantity(i.getQuantity())
                        .status("CREATED")
                        .build()
        ));

        return OrderMapper.toResponse(order);
    }

    // =========================================================
    // NHÂN VIÊN XÁC NHẬN ĐƠN
    // =========================================================
    @Override
    @Transactional
    public OrderResponse confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING
                && order.getStatus() != OrderStatus.PAID) {
            throw new BadRequestException("Chỉ xác nhận được đơn đang PENDING hoặc PAID");
        }

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        order.getItems().forEach(item ->
                inventoryService.confirmOrder(item.getProduct().getId(), item.getQuantity())
        );

        order.getItems().forEach(item ->
                cartService.removeFromCart(order.getUsername(), item.getProduct().getId())
        );

        // Notify realtime qua WebSocket
        orderNotificationService.notifyOrderUpdated(
                order.getUsername(), order.getId(), order.getStatus().name()
        );
        orderNotificationService.notifyCartUpdated(order.getUsername());

        return OrderMapper.toResponse(order);
    }

    // =========================================================
    // NHÂN VIÊN HUỶ ĐƠN
    // =========================================================
    @Override
    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == OrderStatus.COMPLETED
                || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Không thể huỷ đơn ở trạng thái này");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        order.getItems().forEach(item ->
                inventoryService.releaseStock(item.getProduct().getId(), item.getQuantity())
        );

        // Notify realtime qua WebSocket
        orderNotificationService.notifyOrderUpdated(
                order.getUsername(), order.getId(), order.getStatus().name()
        );

        return OrderMapper.toResponse(order);
    }

    // =========================================================
    // HOÀN TẤT ĐƠN
    // =========================================================
    @Override
    @Transactional
    public OrderResponse completeOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Chỉ hoàn tất được đơn đang CONFIRMED");
        }

        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        //Notify realtime qua WebSocket
        orderNotificationService.notifyOrderUpdated(
                order.getUsername(), order.getId(), order.getStatus().name()
        );

        return OrderMapper.toResponse(order);
    }

    @Override
    public OrderResponse getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return OrderMapper.toResponse(order);
    }

    @Override
    public List<Order> getOrdersByUser(String username) {
        return orderRepository.findByUsername(username);
    }
    // KHÁCH XÁC NHẬN NHẬN HÀNG / YÊU CẦU TRẢ HÀNG
// =========================================================
@Override
@Transactional
public OrderResponse updateStatusByCustomer(Long orderId, String username, String status) {
    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

    // Chỉ cho phép chủ đơn hàng thao tác
    if (!order.getUsername().equals(username)) {
        throw new BadRequestException("Bạn không có quyền thao tác đơn hàng này");
    }

    // Chỉ cho phép khi đang DELIVERED
    if (order.getStatus() != OrderStatus.DELIVERED) {
        throw new BadRequestException("Chỉ có thể xác nhận khi đơn đang ở trạng thái DELIVERED");
    }

    switch (status.toUpperCase()) {
        case "COMPLETED" -> order.setStatus(OrderStatus.COMPLETED);
        case "RETURNED"  -> order.setStatus(OrderStatus.RETURNED);
        default -> throw new BadRequestException("Trạng thái không hợp lệ: " + status);
    }

    orderRepository.save(order);

    orderNotificationService.notifyOrderUpdated(
            order.getUsername(), order.getId(), order.getStatus().name()
    );

    return OrderMapper.toResponse(order);
}
}