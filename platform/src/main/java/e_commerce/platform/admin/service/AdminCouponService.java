package e_commerce.platform.admin.service;

import e_commerce.platform.admin.dto.request.coupon.AdminCreateCouponRequest;
import e_commerce.platform.admin.dto.request.coupon.AdminUpdateCouponRequest;
import e_commerce.platform.modules.coupon.entity.Coupon;

import java.util.List;

public interface AdminCouponService {

    List<Coupon> getAllCoupons();
    Coupon getCouponById(Long id);
    void createCoupon(AdminCreateCouponRequest request);
    void updateCoupon(Long id, AdminUpdateCouponRequest request);
    void enableCoupon(Long id);
    void disableCoupon(Long id);
    void deleteCoupon(Long id);
}