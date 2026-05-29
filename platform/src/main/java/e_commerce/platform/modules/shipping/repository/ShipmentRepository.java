package e_commerce.platform.modules.shipping.repository;

import e_commerce.platform.modules.shipping.entity.Shipment;
import e_commerce.platform.modules.shipping.enums.ShipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
 
import java.util.Optional;
 
public interface ShipmentRepository extends JpaRepository<Shipment, String> {
 
    Optional<Shipment> findByOrderId(String orderId);
 
    boolean existsByTrackingNumber(String trackingNumber);
 
    @Query("""
        SELECT s FROM Shipment s
        WHERE (:status IS NULL OR s.status = :status)
          AND (:carrier IS NULL OR LOWER(s.carrier) LIKE LOWER(CONCAT('%', :carrier, '%')))
          AND (:search IS NULL
               OR LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.orderId) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Shipment> findWithFilters(
        @Param("status")  ShipmentStatus status,
        @Param("carrier") String carrier,
        @Param("search")  String search,
        Pageable pageable
    );
}
