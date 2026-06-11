package e_commerce.platform.modules.order.mapper;

import java.util.List;
import java.util.stream.Collectors;

import e_commerce.platform.modules.order.dto.response.OrderItemResponse;
import e_commerce.platform.modules.order.dto.response.OrderResponse;
import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.entity.OrderItem;

public class OrderMapper {

    public static OrderResponse toResponse(Order order) {

        return OrderResponse.builder()
                .id(order.getId())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus().name())
                .items(toItemResponses(order.getItems()))
                .discount(order.getDiscount())
                .finalPrice(order.getFinalPrice())
                .couponCode(order.getCouponCode())
                .receiverName(order.getReceiverName())
                .phone(order.getPhone())
                .address(order.getAddress())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())   
                .updatedAt(order.getUpdatedAt())
                .shippingFee(order.getShippingFee())
                .shippingDiscount(order.getShippingDiscount())
                .build();
    }

    private static List<OrderItemResponse> toItemResponses(List<OrderItem> items) {

        if (items == null) return List.of();

        return items.stream()
                .map(OrderMapper::toItemResponse)
                .collect(Collectors.toList());
    }

    private static OrderItemResponse toItemResponse(OrderItem item) {

        return OrderItemResponse.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .imageUrl(item.getImageUrl())
                .build();
    }
}