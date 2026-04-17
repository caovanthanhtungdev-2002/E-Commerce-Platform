package e_commerce.platform.modules.coupon.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import e_commerce.platform.modules.coupon.entity.Coupon;
import jakarta.persistence.LockModeType;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Coupon> findByCode(String code);
}