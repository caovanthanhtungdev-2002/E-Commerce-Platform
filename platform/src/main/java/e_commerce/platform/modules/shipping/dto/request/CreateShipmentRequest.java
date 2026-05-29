package e_commerce.platform.modules.shipping.dto.request;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateShipmentRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotBlank(message = "Carrier is required")
    private String carrier;

    @NotBlank(message = "Tracking number is required")
    private String trackingNumber;

    @NotNull(message = "Shipping fee is required")
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal shippingFee;

    @NotBlank(message = "Shipping address ID is required")
    private String shippingAddressId;

    private String note;
}
