package e_commerce.platform.modules.order.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import e_commerce.platform.modules.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import e_commerce.platform.modules.order.enums.OrderStatus;

import org.springframework.data.jpa.repository.Modifying;
import java.time.LocalDateTime;

public interface OrderRepository extends JpaRepository<Order, Long> {
@Query("""
        SELECT COUNT(o) > 0
        FROM Order o
        JOIN o.items i
        WHERE o.userId = :userId
          AND i.productId = :productId
          AND o.status = :status
    """)
    boolean hasPurchased(
            @Param("userId") Long userId,
            @Param("productId") Long productId,
            @Param("status") OrderStatus status
    );

@Modifying
@Query("""
    UPDATE Order o
    SET o.status = :cancelled
    WHERE o.status = :pending
      AND o.createdAt < :threshold
""")
int cancelExpiredOrders(
        OrderStatus pending,
        LocalDateTime threshold,
        OrderStatus cancelled
);
}