package e_commerce.platform.admin.repository;

import e_commerce.platform.modules.coupon.entity.Coupon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AdminCouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    @Query("SELECT c FROM Coupon c WHERE c.expiredAt > CURRENT_TIMESTAMP")
    List<Coupon> findActiveCoupons();

    @Query("SELECT COUNT(c) FROM Coupon c WHERE c.usedCount >= c.usageLimit")
    long countFullyUsedCoupons();
}