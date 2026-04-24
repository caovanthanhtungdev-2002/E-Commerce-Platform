package e_commerce.platform.modules.inventory.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import e_commerce.platform.modules.inventory.entity.Inventory;
import jakarta.persistence.LockModeType;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.productId = :productId")
    Optional<Inventory> findByProductId(@Param("productId") Long productId);

    
    @Query("SELECT i FROM Inventory i WHERE i.stock < :threshold")
    List<Inventory> findByStockLessThan(@Param("threshold") int threshold);
}