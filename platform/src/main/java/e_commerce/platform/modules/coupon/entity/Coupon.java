package e_commerce.platform.modules.coupon.entity;

import e_commerce.platform.modules.coupon.enums.CouponType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CouponType type = CouponType.PERCENTAGE;

    // % giảm giá (0 - 100), chỉ dùng khi type = PERCENTAGE
    private double discountPercent;

    // giảm tối đa (vd: max 50k), chỉ dùng khi type = PERCENTAGE hoặc FIXED
    private double maxDiscount;

    // giá tối thiểu để áp dụng
    private Double minOrderValue;

    private LocalDateTime expiryDate;

    private int usageLimit;   // tổng số lượt dùng
    private int usedCount;    // đã dùng

    private boolean active;
}