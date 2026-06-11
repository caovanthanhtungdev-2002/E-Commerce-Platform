package e_commerce.platform.modules.coupon.dto.request;

import lombok.Data;

import jakarta.validation.constraints.*;

@Data
public class ApplyCouponRequest {

    @NotBlank
    private String code;

    @Min(1)
    private double orderAmount;

    private double shippingFee; // dùng cho FREESHIP, mặc định 0
}