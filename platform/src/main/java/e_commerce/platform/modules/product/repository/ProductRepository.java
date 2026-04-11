package e_commerce.platform.modules.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import e_commerce.platform.modules.product.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}