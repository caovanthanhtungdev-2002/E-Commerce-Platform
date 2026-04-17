package e_commerce.platform.modules.coupon.entity;

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

    // % giảm giá (0 - 100)
    private double discountPercent;

    // giảm tối đa (vd: max 50k)
    private double maxDiscount;

    // giá tối thiểu để áp dụng
    private double minOrderValue;

    private LocalDateTime expiryDate;

    private int usageLimit;   // tổng số lượt dùng
    private int usedCount;    // đã dùng

    private boolean active;
}