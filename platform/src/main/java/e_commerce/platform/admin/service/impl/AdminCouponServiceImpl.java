package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.dto.request.coupon.AdminCreateCouponRequest;
import e_commerce.platform.admin.dto.request.coupon.AdminUpdateCouponRequest;
import e_commerce.platform.admin.service.AdminCouponService;
import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ConflictException;
import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.modules.coupon.entity.Coupon;
import e_commerce.platform.modules.coupon.repository.CouponRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCouponServiceImpl implements AdminCouponService {

    private final CouponRepository couponRepository;

    @Override
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Override
    public Coupon getCouponById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + id));
    }

    @Override
    public void createCoupon(AdminCreateCouponRequest request) {
        if (couponRepository.existsByCode(request.getCode().trim())) {
            throw new ConflictException("Coupon code already exists: " + request.getCode());
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().trim().toUpperCase())
                .discountPercent(request.getDiscountValue())
                .maxDiscount(request.getMaxDiscount() != null ? request.getMaxDiscount() : 0)
                .minOrderValue(request.getMinOrderAmount())
                .expiryDate(request.getExpiresAt())
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 0)
                .usedCount(0)
                .active(true)
                .build();

        couponRepository.save(coupon);
    }

    @Override
    public void updateCoupon(Long id, AdminUpdateCouponRequest request) {
        Coupon coupon = getCouponById(id);

        if (request.getCode() != null && !request.getCode().isBlank()) {
            String newCode = request.getCode().trim().toUpperCase();
            if (!newCode.equals(coupon.getCode()) && couponRepository.existsByCode(newCode)) {
                throw new ConflictException("Coupon code already exists: " + newCode);
            }
            coupon.setCode(newCode);
        }

        if (request.getDiscountValue() != null) {
            if (request.getDiscountValue() < 0 || request.getDiscountValue() > 100)
                throw new BadRequestException("Discount percent must be between 0 and 100");
            coupon.setDiscountPercent(request.getDiscountValue());
        }

        if (request.getMaxDiscount() != null) {
            if (request.getMaxDiscount() < 0)
                throw new BadRequestException("Max discount cannot be negative");
            coupon.setMaxDiscount(request.getMaxDiscount());
        }

        if (request.getMinOrderAmount() != null) {
            if (request.getMinOrderAmount() < 0)
                throw new BadRequestException("Min order value cannot be negative");
            coupon.setMinOrderValue(request.getMinOrderAmount());
        }

        if (request.getExpiresAt() != null) {
            if (request.getExpiresAt().isBefore(LocalDateTime.now()))
                throw new BadRequestException("Expiry date must be in the future");
            coupon.setExpiryDate(request.getExpiresAt());
        }

        if (request.getUsageLimit() != null) {
            if (request.getUsageLimit() < 1)
                throw new BadRequestException("Usage limit must be at least 1");
            if (request.getUsageLimit() < coupon.getUsedCount())
                throw new BadRequestException("Usage limit cannot be less than used count: " + coupon.getUsedCount());
            coupon.setUsageLimit(request.getUsageLimit());
        }

        couponRepository.save(coupon);
    }

    @Override
    public void enableCoupon(Long id) {
        Coupon coupon = getCouponById(id);

        if (coupon.isActive())
            throw new BadRequestException("Coupon is already active");

        if (coupon.getExpiryDate().isBefore(LocalDateTime.now()))
            throw new BadRequestException("Cannot enable an expired coupon");

        coupon.setActive(true);
    }

    @Override
    public void disableCoupon(Long id) {
        Coupon coupon = getCouponById(id);

        if (!coupon.isActive())
            throw new BadRequestException("Coupon is already disabled");

        coupon.setActive(false);
    }

    @Override
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id))
            throw new ResourceNotFoundException("Coupon not found: " + id);

        couponRepository.deleteById(id);
    }
}