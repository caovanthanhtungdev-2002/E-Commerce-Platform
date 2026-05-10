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
import e_commerce.platform.modules.order.service.OrderService;
import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.repository.ProductRepository;
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
    private final CouponService couponService;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Override
    @Transactional
    public OrderResponse createOrder(String username, CreateOrderRequest request) {

        List<CartItemResponse> selectedItems;

    //Luồng Buy Now: dùng buyNowItems, không cần cart
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
        // Luồng Cart bình thường
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

        // Tính tổng tiền chỉ từ item được chọn
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

        // Map từ selectedItems
        List<OrderItem> items = selectedItems.stream().map(i -> {
            Product product = productRepository.findById(i.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            return OrderItem.builder()
                    .product(product)
                    .productName(i.getProductName())
                    .price(i.getPrice())
                    .quantity(i.getQuantity())
                    .totalPrice(i.getPrice() * i.getQuantity())
                    .build();
        }).toList();

        // Reserve stock
        items.forEach(i -> inventoryService.reserveStock(
                i.getProduct().getId(),
                i.getQuantity()
        ));

        OrderStatus status = "COD".equals(request.getPaymentMethod())
                ? OrderStatus.PAID
                : OrderStatus.PENDING;

        Order order = Order.builder()
                .username(username)
                .totalPrice(totalPrice)
                .discount(discount)
                .finalPrice(finalPrice)
                .couponCode(couponCode)
                .status(status)
                .createdAt(LocalDateTime.now())
                .receiverName(request.getReceiverName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();

        items.forEach(i -> i.setOrder(order));
        order.setItems(items);
        orderRepository.save(order);

        // Gửi Kafka event
        items.forEach(i -> orderProducer.sendOrderCreated(
                OrderEvent.builder()
                        .orderId(order.getId())
                        .productId(i.getProduct().getId())
                        .quantity(i.getQuantity())
                        .status("CREATED")
                        .build()
        ));

        // COD → xóa cart ngay vì đã thanh toán xong
        // VNPAY → GIỮ LẠI cart, chỉ xóa sau khi payment callback thành công
        if (!isBuyNow && "COD".equals(request.getPaymentMethod())) {
        request.getSelectedProductIds().forEach(productId ->
                cartService.removeFromCart(username, productId)
        );
    }

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
}