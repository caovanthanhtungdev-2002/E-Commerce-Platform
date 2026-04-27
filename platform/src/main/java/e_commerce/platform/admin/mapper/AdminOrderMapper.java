package e_commerce.platform.admin.mapper;

import e_commerce.platform.admin.dto.response.AdminOrderResponse;
import e_commerce.platform.modules.order.entity.Order;

public class AdminOrderMapper {

    // Order entity chưa có address, phone, updatedAt
    // → để null, sau này thêm field vào entity thì update lại
    public static AdminOrderResponse toResponse(Order order) {
        if (order == null) return null;

        return AdminOrderResponse.builder()
                .id(order.getId())
                .username(order.getUsername())
                .totalPrice(order.getTotalPrice())
                .finalPrice(order.getFinalPrice())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .address(order.getAddress())
                .phone(order.getPhone())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}