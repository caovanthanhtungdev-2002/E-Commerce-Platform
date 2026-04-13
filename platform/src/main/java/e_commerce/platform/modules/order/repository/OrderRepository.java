package e_commerce.platform.modules.order.repository;

import e_commerce.platform.modules.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}