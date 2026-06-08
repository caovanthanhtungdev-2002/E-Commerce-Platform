package e_commerce.platform.modules.shipping.repository;

import e_commerce.platform.modules.shipping.entity.ShippingFeeConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShippingFeeConfigRepository extends JpaRepository<ShippingFeeConfig, Long> {
    Optional<ShippingFeeConfig> findByRegion(String region);
}