package e_commerce.platform.modules.coupon.service;

import e_commerce.platform.modules.coupon.dto.request.ApplyCouponRequest;

import e_commerce.platform.modules.coupon.dto.response.CouponResponse;

public interface CouponService {

    CouponResponse applyCoupon(ApplyCouponRequest request);
    void redeemCoupon(String code);
}