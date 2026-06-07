package e_commerce.platform.admin.controller;

import e_commerce.platform.admin.dto.request.coupon.AdminCreateCouponRequest;
import e_commerce.platform.admin.dto.request.coupon.AdminUpdateCouponRequest;
import e_commerce.platform.admin.dto.response.AdminCouponResponse;
import e_commerce.platform.admin.mapper.AdminCouponMapper;
import e_commerce.platform.admin.service.AdminCouponService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final AdminCouponService couponService;

    @GetMapping
    public ResponseEntity<List<AdminCouponResponse>> getAll() {
        return ResponseEntity.ok(
                couponService.getAllCoupons()
                        .stream()
                        .map(AdminCouponMapper::toResponse)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminCouponResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(AdminCouponMapper.toResponse(couponService.getCouponById(id)));
    }

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody @Valid AdminCreateCouponRequest request) {
        couponService.createCoupon(request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id,
                                        @RequestBody AdminUpdateCouponRequest request) {
        couponService.updateCoupon(id, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/enable")
    public ResponseEntity<Void> enable(@PathVariable Long id) {
        couponService.enableCoupon(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/disable")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        couponService.disableCoupon(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok().build();
    }
}