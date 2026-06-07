package e_commerce.platform.admin.mapper;

import e_commerce.platform.admin.dto.response.AdminCouponResponse;
import e_commerce.platform.modules.coupon.entity.Coupon;

public class AdminCouponMapper {

    public static AdminCouponResponse toResponse(Coupon coupon) {
        return AdminCouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType("PERCENT")
                .discountValue(coupon.getDiscountPercent())
                .minOrderAmount(coupon.getMinOrderValue())
                .maxDiscount(coupon.getMaxDiscount())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .active(coupon.isActive())
                .expiresAt(coupon.getExpiryDate())
                .build();
    }
}