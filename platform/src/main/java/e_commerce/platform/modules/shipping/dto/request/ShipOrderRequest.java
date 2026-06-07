package e_commerce.platform.modules.shipping.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ShipOrderRequest {

    @NotBlank(message = "Carrier is required")
    private String carrier;

    @NotNull(message = "Shipping fee is required")
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal shippingFee;

    private String trackingNumber; // nếu null thì tự sinh
}
