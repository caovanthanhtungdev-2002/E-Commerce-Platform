package e_commerce.platform.modules.order.repository;

import e_commerce.platform.modules.order.entity.Order;
import e_commerce.platform.modules.order.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // ================================
    // ADMIN: filter đa điều kiện
    // ================================
    @Query("""
        SELECT o FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
          AND (:username IS NULL OR o.username = :username)
          AND (:from IS NULL OR o.createdAt >= :from)
          AND (:to IS NULL OR o.createdAt <= :to)
    """)
    List<Order> filterOrders(
            @Param("status") OrderStatus status,
            @Param("username") String username,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

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
    // JOB: Huỷ order quá hạn
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

    @Query("SELECT SUM(o.finalPrice) FROM Order o WHERE o.status = 'PAID'")
    Double sumRevenue();

    @Query("""
        SELECT DATE(o.createdAt), SUM(o.finalPrice)
        FROM Order o
        WHERE o.status = 'PAID'
        GROUP BY DATE(o.createdAt)
        ORDER BY DATE(o.createdAt)
    """)
    List<Object[]> revenueByDay();

    @Query("""
        SELECT i.productName, SUM(i.quantity)
        FROM OrderItem i
        JOIN i.order o
        WHERE o.status = 'PAID'
        GROUP BY i.productName
        ORDER BY SUM(i.quantity) DESC
    """)
    List<Object[]> topSellingProducts();

    @Query("""
        SELECT o.status, COUNT(o)
        FROM Order o
        GROUP BY o.status
    """)
    List<Object[]> orderStatusStats();

    Page<Order> findAll(Pageable pageable);
}