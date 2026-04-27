package e_commerce.platform.admin.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminAdjustStockRequest {

    @NotNull
    private Long productId;

    @Min(value = 0, message = "Stock must be >= 0")
    private Integer quantity;
}