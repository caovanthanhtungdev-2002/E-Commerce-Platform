package e_commerce.platform.modules.order.mapper;

import e_commerce.platform.modules.order.dto.response.*;
import e_commerce.platform.modules.order.entity.*;

import java.util.List;
import java.util.stream.Collectors;

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
                .productId(item.getProductId())
                .productName(item.getProductName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .build();
    }
}