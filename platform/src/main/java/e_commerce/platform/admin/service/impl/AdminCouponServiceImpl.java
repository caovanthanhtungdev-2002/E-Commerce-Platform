package e_commerce.platform.admin.service.impl;

import e_commerce.platform.admin.service.AdminCouponService;

import e_commerce.platform.modules.coupon.dto.request.CreateCouponRequest;
import e_commerce.platform.modules.coupon.dto.request.UpdateCouponRequest;
import e_commerce.platform.modules.coupon.entity.Coupon;
import e_commerce.platform.modules.coupon.repository.CouponRepository;

import e_commerce.platform.exception.ResourceNotFoundException;
import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.exception.ConflictException;

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

    // ================= GET ALL =================
    @Override
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    // ================= GET BY ID =================
    @Override
    public Coupon getCouponById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Coupon not found with id: " + id));
    }

    // ================= GET BY CODE =================
    @Override
    public Coupon getByCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new BadRequestException("Coupon code is required");
        }
        return couponRepository.findByCode(code.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Coupon not found with code: " + code));
    }

    // ================= CREATE =================
    @Override
    public void createCoupon(CreateCouponRequest request) {

        validateRequest(request);

        if (couponRepository.existsByCode(request.getCode().trim())) {
            throw new ConflictException("Coupon code already exists: " + request.getCode());
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().trim().toUpperCase())
                .discountPercent(request.getDiscountPercent())
                .maxDiscount(request.getMaxDiscount())
                .minOrderValue(request.getMinOrderValue())
                .expiryDate(request.getExpiryDate())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .active(true)
                .build();

        couponRepository.save(coupon);
    }

   // ================= UPDATE =================
@Override
public void updateCoupon(Long id, UpdateCouponRequest request) {

    Coupon coupon = getCouponById(id);

    // update code nếu thay đổi
    if (request.getCode() != null && !request.getCode().isBlank()) {
        String newCode = request.getCode().trim().toUpperCase();

        if (!newCode.equals(coupon.getCode())
                && couponRepository.existsByCode(newCode)) {
            throw new ConflictException("Coupon code already exists: " + newCode);
        }

        coupon.setCode(newCode);
    }

    if (request.getDiscountPercent() != null) {
        if (request.getDiscountPercent() < 0 || request.getDiscountPercent() > 100) {
            throw new BadRequestException("Discount percent must be between 0 and 100");
        }
        coupon.setDiscountPercent(request.getDiscountPercent());
    }

    if (request.getMaxDiscount() != null) {
        if (request.getMaxDiscount() < 0) {
            throw new BadRequestException("Max discount cannot be negative");
        }
        coupon.setMaxDiscount(request.getMaxDiscount());
    }

    if (request.getMinOrderValue() != null) {
        if (request.getMinOrderValue() < 0) {
            throw new BadRequestException("Min order value cannot be negative");
        }
        coupon.setMinOrderValue(request.getMinOrderValue());
    }

    if (request.getUsageLimit() != null) {
        if (request.getUsageLimit() < 1) {
            throw new BadRequestException("Usage limit must be at least 1");
        }
        if (request.getUsageLimit() < coupon.getUsedCount()) {
            throw new BadRequestException(
                    "Usage limit cannot be less than used count: " + coupon.getUsedCount());
        }
        coupon.setUsageLimit(request.getUsageLimit());
    }

    if (request.getExpiryDate() != null) {
        if (request.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Expiry date must be in the future");
        }
        coupon.setExpiryDate(request.getExpiryDate());
    }
}

    // ================= ENABLE =================
    @Override
    public void enableCoupon(Long id) {
        Coupon coupon = getCouponById(id);

        if (coupon.isActive()) {
            throw new BadRequestException("Coupon is already active");
        }

        // kiểm tra chưa hết hạn mới cho enable
        if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot enable an expired coupon");
        }

        coupon.setActive(true);
    }

    // ================= DISABLE =================
    @Override
    public void disableCoupon(Long id) {
        Coupon coupon = getCouponById(id);

        if (!coupon.isActive()) {
            throw new BadRequestException("Coupon is already disabled");
        }

        coupon.setActive(false);
    }

    // ================= DELETE =================
    @Override
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon not found with id: " + id);
        }
        couponRepository.deleteById(id);
    }

    // ================= PRIVATE VALIDATE =================
    private void validateRequest(CreateCouponRequest request) {

        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new BadRequestException("Coupon code is required");
        }

        if (request.getDiscountPercent() < 0 || request.getDiscountPercent() > 100) {
            throw new BadRequestException("Discount percent must be between 0 and 100");
        }

        if (request.getMaxDiscount() < 0) {
            throw new BadRequestException("Max discount cannot be negative");
        }

        if (request.getMinOrderValue() < 0) {
            throw new BadRequestException("Min order value cannot be negative");
        }

        if (request.getUsageLimit() < 1) {
            throw new BadRequestException("Usage limit must be at least 1");
        }

        if (request.getExpiryDate() == null) {
            throw new BadRequestException("Expiry date is required");
        }

        if (request.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Expiry date must be in the future");
        }
    }
}