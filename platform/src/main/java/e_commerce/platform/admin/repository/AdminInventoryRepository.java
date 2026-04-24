package e_commerce.platform.admin.repository;

import e_commerce.platform.modules.inventory.entity.Inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AdminInventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    @Query("SELECT i FROM Inventory i WHERE i.stock < 10")
    List<Inventory> findLowStock();

    @Modifying
    @Query("""
        UPDATE Inventory i
        SET i.stock = i.stock + :amount
        WHERE i.productId = :productId
    """)
    void increaseStock(@Param("productId") Long productId,
                       @Param("amount") int amount);

    @Modifying
    @Query("""
        UPDATE Inventory i
        SET i.stock = i.stock - :amount
        WHERE i.productId = :productId
    """)
    void decreaseStock(@Param("productId") Long productId,
                       @Param("amount") int amount);
}