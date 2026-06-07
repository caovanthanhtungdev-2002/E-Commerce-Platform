package e_commerce.platform.admin.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminCouponResponse {

    private Long id;
    private String code;
    private String discountType;
    private double discountValue;
    private Double minOrderAmount;
    private Double maxDiscount;
    private Integer usageLimit;
    private int usedCount;
    private boolean active;
    private LocalDateTime expiresAt;
}