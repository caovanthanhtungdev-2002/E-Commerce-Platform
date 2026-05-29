package e_commerce.platform.modules.shipping.dto.request;


import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateReturnRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotNull(message = "Refund amount is required")
    @DecimalMin("0.0")
    private BigDecimal refundAmount;

    @NotEmpty(message = "Return items are required")
    @Valid
    private List<ReturnItemRequest> returnItems;
}
