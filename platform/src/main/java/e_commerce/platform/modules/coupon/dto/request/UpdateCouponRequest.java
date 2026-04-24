package e_commerce.platform.modules.coupon.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateCouponRequest {

    private String code;

    private Double discountPercent;   

    private Double maxDiscount;

    private Double minOrderValue;

    private LocalDateTime expiryDate;

    private Integer usageLimit;      
}