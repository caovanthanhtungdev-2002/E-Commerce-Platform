package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.dto.response.AdminOrderResponse;
import e_commerce.platform.admin.service.AdminOrderService;
import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.cart.service.CartService;
import e_commerce.platform.modules.inventory.service.InventoryService;
import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.entity.OrderItem;
import e_commerce.platform.modules.order.enums.OrderStatus;
import e_commerce.platform.modules.order.repository.OrderRepository;
import e_commerce.platform.modules.order.service.OrderNotificationService;
import e_commerce.platform.modules.shipping.dto.request.CreateShipmentRequest;
import e_commerce.platform.modules.shipping.entity.ShippingAddress;
import e_commerce.platform.modules.shipping.repository.ShippingAddressRepository;
import e_commerce.platform.modules.shipping.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminOrderServiceImpl implements AdminOrderService {

    private final OrderRepository             orderRepository;
    private final OrderNotificationService    orderNotificationService;
    private final CartService                 cartService;
    private final InventoryService            inventoryService;
    private final ShipmentService             shipmentService;
    private final ShippingAddressRepository   shippingAddressRepository;

    @Override
    public List<AdminOrderResponse> getOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepository.findAll(pageable)
                .getContent()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AdminOrderResponse getOrderById(Long orderId) {
        return toResponse(findOrderById(orderId));
    }

    @Override
    public List<AdminOrderResponse> filterOrders(OrderStatus status, String username,
                                                  LocalDateTime from, LocalDateTime to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new BadRequestException("'from' date must be before 'to' date");
        }
        return orderRepository.filterOrders(status, username, from, to)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = findOrderById(orderId);
        validateStatusTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        orderRepository.save(order);
    }

    // ================= CONFIRM =================
    @Override
    public void confirmOrder(Long orderId) {
        Order order = findOrderById(orderId);

        if (order.getStatus() != OrderStatus.PENDING
                && order.getStatus() != OrderStatus.PAID
                && order.getStatus() != OrderStatus.AWAITING_PAYMENT){
            throw new BadRequestException(
                "Chỉ xác nhận được đơn PENDING hoặc PAID. Status hiện tại: "
                + order.getStatus());
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
    }

    // ================= CANCEL =================
    @Override
    public void cancelOrder(Long orderId, String reason) {
        Order order = findOrderById(orderId);

        if (order.getStatus() != OrderStatus.PENDING
                && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException(
                    "Only PENDING or CONFIRMED orders can be cancelled. Current status: "
                    + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        orderNotificationService.notifyOrderUpdated(
                order.getUsername(), order.getId(), order.getStatus().name()
        );
    }

    // ================= REFUND =================
    @Override
    public void refundOrder(Long orderId) {
        Order order = findOrderById(orderId);

        if (order.getStatus() != OrderStatus.PAID
                && order.getStatus() != OrderStatus.DELIVERED
                && order.getStatus() != OrderStatus.COMPLETED) {
            throw new BadRequestException(
                    "Only PAID, DELIVERED or COMPLETED orders can be refunded. Current status: "
                    + order.getStatus());
        }

        if (order.getStatus() == OrderStatus.COMPLETED) {
            LocalDateTime deadline = order.getUpdatedAt().plusDays(7);
            if (LocalDateTime.now().isAfter(deadline)) {
                throw new BadRequestException(
                    "Đã quá 7 ngày kể từ khi hoàn tất đơn hàng, không thể hoàn tiền.");
            }
        }

        order.setStatus(OrderStatus.REFUNDED);
        orderRepository.save(order);

        orderNotificationService.notifyOrderUpdated(
                order.getUsername(), order.getId(), order.getStatus().name()
        );
    }

    // ================= FORCE COMPLETE =================
    @Override
    public void forceCompleteOrder(Long orderId) {
        Order order = findOrderById(orderId);

        if (order.getStatus() != OrderStatus.PAID
                && order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException(
                    "Only PAID or DELIVERED orders can be completed. Current status: "
                    + order.getStatus());
        }

        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        orderNotificationService.notifyOrderUpdated(
                order.getUsername(), order.getId(), order.getStatus().name()
        );
    }

    // ================= DELETE =================
    @Override
    public void deleteOrder(Long orderId) {
        Order order = findOrderById(orderId);

        if (order.getStatus() != OrderStatus.CANCELLED
                && order.getStatus() != OrderStatus.REFUNDED) {
            throw new BadRequestException(
                    "Only CANCELLED or REFUNDED orders can be deleted. Current status: "
                    + order.getStatus());
        }

        orderRepository.deleteById(orderId);
    }

    // ================= PROCESS =================
    @Override
    public void processOrder(Long orderId) {
        Order order = findOrderById(orderId);
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException(
                "Only CONFIRMED orders can be processed. Current: " + order.getStatus());
        }
        order.setStatus(OrderStatus.PROCESSING);
        orderRepository.save(order);
        orderNotificationService.notifyOrderUpdated(
            order.getUsername(), order.getId(), order.getStatus().name());
    }

    // ================= SHIP =================
    @Override
    public void shipOrder(Long orderId) {
        Order order = findOrderById(orderId);
        if (order.getStatus() != OrderStatus.PROCESSING) {
            throw new BadRequestException(
                "Only PROCESSING orders can be shipped. Current: " + order.getStatus());
        }
        order.setStatus(OrderStatus.SHIPPED);
        orderRepository.save(order);

        // Tạo ShippingAddress từ thông tin order
        ShippingAddress address = ShippingAddress.builder()
            .userId(String.valueOf(order.getUserId()))
            .receiverName(order.getReceiverName() != null
                ? order.getReceiverName() : order.getUsername())
            .receiverPhone(order.getPhone() != null ? order.getPhone() : "")
            .addressLine(order.getAddress() != null ? order.getAddress() : "")
            .country("Vietnam")
            .note("Tự động tạo từ đơn hàng #" + orderId)
            .build();
        ShippingAddress savedAddress = shippingAddressRepository.save(address);

        // Tạo Shipment record — admin cập nhật carrier/tracking thật sau
        CreateShipmentRequest req = CreateShipmentRequest.builder()
            .orderId(String.valueOf(orderId))
            .carrier("Chưa xác định")
            .trackingNumber("ORD-" + orderId + "-" + System.currentTimeMillis())
            .shippingFee(BigDecimal.ZERO)
            .shippingAddressId(savedAddress.getId())
            .note("Tạo tự động từ đơn hàng #" + orderId)
            .build();
        shipmentService.create(req);

        orderNotificationService.notifyOrderUpdated(
            order.getUsername(), order.getId(), order.getStatus().name());
    }

    // ================= DELIVER =================
    @Override
    public void deliverOrder(Long orderId) {
        Order order = findOrderById(orderId);
        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new BadRequestException(
                "Only SHIPPED orders can be delivered. Current: " + order.getStatus());
        }
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);
        orderNotificationService.notifyOrderUpdated(
            order.getUsername(), order.getId(), order.getStatus().name());
    }

    // ================= PRIVATE =================
    private Order findOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + orderId));
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case AWAITING_PAYMENT -> next == OrderStatus.CANCELLED;  

            case PENDING    -> next == OrderStatus.CONFIRMED
                            || next == OrderStatus.CANCELLED;
            case CONFIRMED  -> next == OrderStatus.PROCESSING
                            || next == OrderStatus.PAID
                            || next == OrderStatus.CANCELLED;
            case PROCESSING -> next == OrderStatus.SHIPPED
                            || next == OrderStatus.CANCELLED;
            case SHIPPED    -> next == OrderStatus.DELIVERED
                            || next == OrderStatus.CANCELLED;
            case DELIVERED  -> next == OrderStatus.COMPLETED
                            || next == OrderStatus.REFUNDED;
            case PAID       -> next == OrderStatus.CONFIRMED
                            || next == OrderStatus.COMPLETED
                            || next == OrderStatus.REFUNDED;
            case CANCELLED,
                 REFUNDED,
                 COMPLETED,
                 RETURNED   -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                    "Invalid status transition: " + current + " → " + next);
        }
    }

    private AdminOrderResponse toResponse(Order order) {
        List<AdminOrderResponse.OrderItemResponse> itemResponses =
                order.getItems() == null
                        ? Collections.emptyList()
                        : order.getItems().stream()
                                .map(this::toItemResponse)
                                .toList();

        return AdminOrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .username(order.getUsername())
                .totalPrice(order.getTotalPrice())
                .discount(order.getDiscount())
                .finalPrice(order.getFinalPrice())
                .couponCode(order.getCouponCode())
                .status(order.getStatus())
                .receiverName(order.getReceiverName())
                .address(order.getAddress())
                .phone(order.getPhone())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .paymentMethod(order.getPaymentMethod())
                .build();
    }

    private AdminOrderResponse.OrderItemResponse toItemResponse(OrderItem item) {
        return AdminOrderResponse.OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}