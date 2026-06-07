package e_commerce.platform.admin.dto.request.coupon;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdminCreateCouponRequest {

    @NotBlank
    private String code;

    private String discountType = "PERCENT";

    @Min(0)
    private double discountValue;

    @Min(0)
    private Double minOrderAmount;

    @Min(0)
    private Double maxDiscount;

    @NotNull
    private LocalDateTime expiresAt;

    @Min(1)
    private Integer usageLimit;
}