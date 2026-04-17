package e_commerce.platform.modules.coupon.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

import jakarta.validation.constraints.*;

@Data
public class CreateCouponRequest {

    @NotBlank
    private String code;

    @Min(0)
    @Max(100)
    private double discountPercent;

    @Min(0)
    private double maxDiscount;

    @Min(0)
    private double minOrderValue;

    @NotNull
    private LocalDateTime expiryDate;

    @Min(1)
    private int usageLimit;
}