package e_commerce.platform.admin.dto.response;

import e_commerce.platform.modules.order.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminOrderResponse {

    private Long id;

    private String username;

    private Double totalPrice;

    private Double finalPrice;

    private OrderStatus status;

    private String address;

    private String phone;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}