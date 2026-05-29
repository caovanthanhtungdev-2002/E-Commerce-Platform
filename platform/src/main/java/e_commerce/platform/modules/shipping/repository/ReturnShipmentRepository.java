package e_commerce.platform.modules.shipping.repository;

import e_commerce.platform.modules.shipping.entity.ReturnShipment;
import e_commerce.platform.modules.shipping.enums.ReturnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
 
public interface ReturnShipmentRepository extends JpaRepository<ReturnShipment, String> {
 
    @Query("""
        SELECT r FROM ReturnShipment r
        WHERE (:status IS NULL OR r.status = :status)
    """)
    Page<ReturnShipment> findWithFilters(
        @Param("status") ReturnStatus status,
        Pageable pageable
    );
 
    boolean existsByOrderId(String orderId);
}
