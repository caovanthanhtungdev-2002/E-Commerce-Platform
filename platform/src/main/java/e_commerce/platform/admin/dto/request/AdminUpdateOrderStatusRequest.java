package e_commerce.platform.admin.dto.request;

import e_commerce.platform.modules.order.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUpdateOrderStatusRequest {

    @NotNull
    private Long orderId;

    @NotNull
    private OrderStatus status;
}