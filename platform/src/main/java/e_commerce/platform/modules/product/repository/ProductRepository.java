
package e_commerce.platform.modules.product.repository;

import e_commerce.platform.modules.product.entity.Product;
import e_commerce.platform.modules.product.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

public interface ProductRepository extends
        JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    // User: chỉ xem ACTIVE
    @EntityGraph(attributePaths = {"category"})
    Page<Product> findAllByStatus(ProductStatus status, Pageable pageable);
}
