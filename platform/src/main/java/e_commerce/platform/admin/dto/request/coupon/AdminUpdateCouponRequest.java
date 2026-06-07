package e_commerce.platform.admin.dto.request.coupon;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdminUpdateCouponRequest {

    private String code;
    private String discountType;
    private Double discountValue;
    private Double minOrderAmount;
    private Double maxDiscount;
    private LocalDateTime expiresAt;
    private Integer usageLimit;
}