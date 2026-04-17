package e_commerce.platform.modules.coupon.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import e_commerce.platform.exception.BadRequestException;
import e_commerce.platform.modules.coupon.dto.request.ApplyCouponRequest;
import e_commerce.platform.modules.coupon.dto.request.CreateCouponRequest;
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
    @Transactional
    public CouponResponse applyCoupon(ApplyCouponRequest request) {

        Coupon coupon = couponRepository.findByCode(request.getCode())
                .orElseThrow(() -> new BadRequestException("Mã không tồn tại"));

        //inactive
        if (!coupon.isActive()) {
            throw new BadRequestException("Mã đã bị vô hiệu hóa");
        }

        // hết hạn
        if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã đã hết hạn");
        }

        // hết lượt
        if (coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Mã đã hết lượt sử dụng");
        }

        // chưa đủ tiền
        if (request.getOrderAmount() < coupon.getMinOrderValue()) {
            throw new BadRequestException("Chưa đạt giá trị tối thiểu");
        }

        //tính giảm giá
        double discount = request.getOrderAmount() * (coupon.getDiscountPercent() / 100);

        //giới hạn max
        if (discount > coupon.getMaxDiscount()) {
            discount = coupon.getMaxDiscount();
        }

        double finalAmount = request.getOrderAmount() - discount;

        //check lại trước khi tăng (tránh race condition cơ bản)
        if (coupon.getUsedCount() + 1 > coupon.getUsageLimit()) {
            throw new BadRequestException("Mã đã hết lượt sử dụng");
        }

        // tăng lượt dùng
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        return new CouponResponse(
                coupon.getCode(),
                discount,
                finalAmount
        );
    }

    @Override
    public void createCoupon(CreateCouponRequest request) {

        //check trùng code 
        if (couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new BadRequestException("Mã coupon đã tồn tại");
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode())
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
}