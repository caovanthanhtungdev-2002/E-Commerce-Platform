package e_commerce.platform.modules.coupon.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.modules.coupon.dto.request.ApplyCouponRequest;
import e_commerce.platform.modules.coupon.dto.response.CouponResponse;
import e_commerce.platform.modules.coupon.entity.Coupon;
import e_commerce.platform.modules.coupon.repository.CouponRepository;
import e_commerce.platform.modules.coupon.service.CouponService;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public CouponResponse applyCoupon(ApplyCouponRequest request) {
        Coupon coupon = couponRepository.findByCode(request.getCode())
                .orElseThrow(() -> new BadRequestException("Mã không tồn tại"));

        if (!coupon.isActive())
            throw new BadRequestException("Mã đã bị vô hiệu hóa");

        if (coupon.getExpiryDate() != null &&
                coupon.getExpiryDate().isBefore(LocalDateTime.now()))
            throw new BadRequestException("Mã đã hết hạn");

        if (coupon.getUsedCount() >= coupon.getUsageLimit())
            throw new BadRequestException("Mã đã hết lượt sử dụng");

        if (coupon.getMinOrderValue() != null &&
                request.getOrderAmount() < coupon.getMinOrderValue())
            throw new BadRequestException("Chưa đạt giá trị tối thiểu để dùng mã");

        double discount = switch (coupon.getType()) {
            case FREESHIP -> request.getShippingFee(); // miễn toàn bộ phí ship
            case FIXED -> Math.min(coupon.getMaxDiscount(), request.getOrderAmount());
            case PERCENTAGE -> {
                double d = request.getOrderAmount() * (coupon.getDiscountPercent() / 100.0);
                yield Math.min(d, coupon.getMaxDiscount());
            }
        };

        double finalAmount = request.getOrderAmount() - discount;

        return new CouponResponse(coupon.getCode(), coupon.getType().name(), discount, finalAmount);
    }

    @Override
    public void redeemCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new BadRequestException("Mã không tồn tại"));

        if (coupon.getUsedCount() >= coupon.getUsageLimit())
            throw new BadRequestException("Mã đã hết lượt sử dụng");

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }
}