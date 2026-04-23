package e_commerce.platform.modules.order.repository;

import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // ================================
    // CHECK: User đã từng mua product chưa
    // ================================
    @Query("""
        SELECT COUNT(o) > 0
        FROM Order o
        JOIN o.items i
        WHERE o.userId = :userId
          AND i.product.id = :productId
          AND o.status = :status
    """)
    boolean hasPurchased(
            @Param("userId") Long userId,
            @Param("productId") Long productId,
            @Param("status") OrderStatus status
    );

    // ================================
    // JOB: Huỷ order quá hạn (cron/job system)
    // ================================
    @Modifying
    @Query("""
        UPDATE Order o
        SET o.status = :cancelled
        WHERE o.status = :pending
          AND o.createdAt < :threshold
    """)
    int cancelExpiredOrders(
            @Param("pending") OrderStatus pending,
            @Param("threshold") LocalDateTime threshold,
            @Param("cancelled") OrderStatus cancelled
    );
}