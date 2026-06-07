package e_commerce.platform.modules.coupon.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import e_commerce.platform.modules.coupon.dto.request.ApplyCouponRequest;
import e_commerce.platform.modules.coupon.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    // apply coupon
    @PostMapping("/apply")
    public ResponseEntity<?> apply(@Valid @RequestBody ApplyCouponRequest request) {
        return ResponseEntity.ok(couponService.applyCoupon(request));
    }

}
