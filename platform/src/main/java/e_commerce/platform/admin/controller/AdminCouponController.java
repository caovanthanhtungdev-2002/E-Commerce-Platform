package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.service.AdminCouponService;
import e_commerce.platform.modules.coupon.dto.request.CreateCouponRequest;
import e_commerce.platform.modules.coupon.dto.request.UpdateCouponRequest;
import e_commerce.platform.modules.coupon.entity.Coupon;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final AdminCouponService couponService;

    @GetMapping
    public List<Coupon> getAll() {
        return couponService.getAllCoupons();
    }

    @GetMapping("/{id}")
    public Coupon getById(@PathVariable Long id) {
        return couponService.getCouponById(id);
    }

    @PostMapping
    public void create(@RequestBody CreateCouponRequest request) {
        couponService.createCoupon(request);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id,
                       @RequestBody UpdateCouponRequest request) {
        couponService.updateCoupon(id, request);
    }

    @PatchMapping("/{id}/enable")
    public void enable(@PathVariable Long id) {
        couponService.enableCoupon(id);
    }

    @PatchMapping("/{id}/disable")
    public void disable(@PathVariable Long id) {
        couponService.disableCoupon(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        couponService.deleteCoupon(id);
    }
}