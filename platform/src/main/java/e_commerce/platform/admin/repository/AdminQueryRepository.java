package e_commerce.platform.admin.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AdminQueryRepository {

    @PersistenceContext
    private EntityManager em;

    public List<Object[]> revenueByDay() {
        return em.createQuery("""
            SELECT FUNCTION('DATE', o.createdAt), SUM(o.finalPrice)
            FROM Order o
            WHERE o.status = 'PAID'
            GROUP BY FUNCTION('DATE', o.createdAt)
            ORDER BY FUNCTION('DATE', o.createdAt)
        """, Object[].class).getResultList();
    }

    public List<Object[]> topProducts() {
        return em.createQuery("""
            SELECT oi.productName, SUM(oi.quantity)
            FROM OrderItem oi
            GROUP BY oi.productName
            ORDER BY SUM(oi.quantity) DESC
        """, Object[].class)
        .setMaxResults(10)
        .getResultList();
    }

    public List<Object[]> orderStatusStats() {
        return em.createQuery("""
            SELECT o.status, COUNT(o)
            FROM Order o
            GROUP BY o.status
        """, Object[].class).getResultList();
    }
}