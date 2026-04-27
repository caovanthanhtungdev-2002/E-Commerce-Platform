package e_commerce.platform.admin.repository;

import e_commerce.platform.modules.coupon.entity.Coupon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AdminCouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    boolean existsByCode(String code);

    
    @Query("SELECT c FROM Coupon c WHERE c.expiryDate > CURRENT_TIMESTAMP AND c.active = true")
    List<Coupon> findActiveCoupons();

    @Query("SELECT c FROM Coupon c WHERE c.expiryDate < :now")
    List<Coupon> findExpiredCoupons(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(c) FROM Coupon c WHERE c.active = true")
    long countActiveCoupons();
}