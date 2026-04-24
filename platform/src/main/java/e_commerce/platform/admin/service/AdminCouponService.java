package e_commerce.platform.admin.service;

import e_commerce.platform.modules.coupon.entity.Coupon;
import e_commerce.platform.modules.coupon.dto.request.CreateCouponRequest;
import e_commerce.platform.modules.coupon.dto.request.UpdateCouponRequest;

import java.util.List;

public interface AdminCouponService {

    List<Coupon> getAllCoupons();

    Coupon getCouponById(Long id);

    Coupon getByCode(String code);

    void createCoupon(CreateCouponRequest request);

    void updateCoupon(Long id, UpdateCouponRequest request);  

    void enableCoupon(Long id);

    void disableCoupon(Long id);

    void deleteCoupon(Long id);
}