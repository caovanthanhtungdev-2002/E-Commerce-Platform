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
import e_commerce.platform.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository          orderRepository;
    private final CartService              cartService;
    private final OrderProducer            orderProducer;
    private final CouponService            couponService;
    private final ProductRepository        productRepository;
    private final InventoryService         inventoryService;
    private final OrderNotificationService orderNotificationService;
    private final UserRepository           userRepository;

    // =========================================================
    // TẠO ĐƠN HÀNG
    // =========================================================
    @Override
    @Transactional
    public OrderResponse createOrder(String username, CreateOrderRequest request) {

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"))
                .getId();

        List<CartItemResponse> selectedItems;
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

        // khai báo shippingFee trước để dùng trong applyCoupon (FREESHIP)
        double shippingFee = request.getShippingFee() != null ? request.getShippingFee() : 0.0;

        double discount = 0;
double shippingDiscount = 0;
String couponCode = null;

if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
    ApplyCouponRequest couponRequest = new ApplyCouponRequest();
    couponRequest.setCode(request.getCouponCode());
    couponRequest.setOrderAmount(totalPrice);
    couponRequest.setShippingFee(shippingFee);
    CouponResponse couponResponse = couponService.applyCoupon(couponRequest);
    couponCode = couponResponse.getCode();
    couponService.redeemCoupon(request.getCouponCode());

    if ("FREESHIP".equalsIgnoreCase(couponResponse.getType())) {
        shippingDiscount = couponResponse.getDiscount();
    } else {
        discount = couponResponse.getDiscount();
    }
}

if (request.getFreeshipCode() != null && !request.getFreeshipCode().isEmpty()) {
    ApplyCouponRequest freeshipRequest = new ApplyCouponRequest();
    freeshipRequest.setCode(request.getFreeshipCode());
    freeshipRequest.setOrderAmount(totalPrice);
    freeshipRequest.setShippingFee(shippingFee);
    CouponResponse freeshipResponse = couponService.applyCoupon(freeshipRequest);
    if ("FREESHIP".equalsIgnoreCase(freeshipResponse.getType())) {
        shippingDiscount = freeshipResponse.getDiscount();
        couponService.redeemCoupon(request.getFreeshipCode());
    }
}

double finalPrice = Math.max(0, totalPrice - discount) + Math.max(0, shippingFee - shippingDiscount);

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
                i.getProduct().getId(), i.getQuantity()
        ));

        Order order = Order.builder()
                .userId(userId)
                .username(username)
                .totalPrice(totalPrice)
                .discount(discount)
                .shippingFee(shippingFee)
                .finalPrice(finalPrice)
                .couponCode(couponCode)
                .status("VNPAY".equalsIgnoreCase(request.getPaymentMethod())
                        ? OrderStatus.AWAITING_PAYMENT
                        : OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .receiverName(request.getReceiverName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .paymentMethod(request.getPaymentMethod())
                .shippingDiscount(shippingDiscount)
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
                && order.getStatus() != OrderStatus.PAID
                && order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
            throw new BadRequestException("Chỉ xác nhận được đơn PENDING hoặc PAID");
        }

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        order.getItems().forEach(item ->
                inventoryService.confirmOrder(item.getProduct().getId(), item.getQuantity())
        );
        order.getItems().forEach(item ->
                cartService.removeFromCart(order.getUsername(), item.getProduct().getId())
        );

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

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Chỉ hoàn tất được đơn đang DELIVERED");
        }

        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        orderNotificationService.notifyOrderUpdated(
                order.getUsername(), order.getId(), order.getStatus().name()
        );

        return OrderMapper.toResponse(order);
    }

    // =========================================================
    // LẤY ĐƠN HÀNG
    // =========================================================
    @Override
    public OrderResponse getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return OrderMapper.toResponse(order);
    }

    // lịch sử đơn hàng
    @Override
    public List<Order> getOrdersByUser(String username) {
        return orderRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    // =========================================================
    // KHÁCH XÁC NHẬN NHẬN HÀNG / YÊU CẦU TRẢ HÀNG / HỦY ĐƠN
    // =========================================================
    @Override
    @Transactional
    public OrderResponse updateStatusByCustomer(Long orderId, String username, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUsername().equals(username)) {
            throw new BadRequestException("Bạn không có quyền thao tác đơn hàng này");
        }

        switch (status.toUpperCase()) {

            case "COMPLETED" -> {
                if (order.getStatus() != OrderStatus.DELIVERED) {
                    throw new BadRequestException(
                            "Chỉ xác nhận hoàn tất khi đơn đang DELIVERED");
                }
                order.setStatus(OrderStatus.COMPLETED);
            }

            case "RETURNED" -> {
                if (order.getStatus() != OrderStatus.DELIVERED) {
                    throw new BadRequestException(
                            "Chỉ yêu cầu trả hàng khi đơn đang DELIVERED");
                }
                order.setStatus(OrderStatus.RETURNED);
            }

            case "CANCELLED" -> {
                if (order.getStatus() != OrderStatus.PENDING
                        && order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
                    throw new BadRequestException(
                            "Khách chỉ hủy được đơn khi đang PENDING hoặc AWAITING_PAYMENT");
                }
                order.getItems().forEach(item ->
                        inventoryService.releaseStock(
                                item.getProduct().getId(), item.getQuantity())
                );
                order.setStatus(OrderStatus.CANCELLED);
            }

            default -> throw new BadRequestException(
                    "Trạng thái không hợp lệ: " + status);
        }

        orderRepository.save(order);

        orderNotificationService.notifyOrderUpdated(
                order.getUsername(), order.getId(), order.getStatus().name()
        );

        return OrderMapper.toResponse(order);
    }
}