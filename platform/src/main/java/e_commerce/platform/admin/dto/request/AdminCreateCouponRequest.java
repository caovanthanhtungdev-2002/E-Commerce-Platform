package e_commerce.platform.admin.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminCreateCouponRequest {

    @NotBlank
    private String code;

    @Min(0)
    @Max(100)
    private Integer discountPercent;

    @Min(0)
    private Double maxDiscount;

    @Min(0)
    private Double minOrderValue;

    @Future
    private LocalDateTime expiryDate;

    @Min(1)
    private Integer usageLimit;
}