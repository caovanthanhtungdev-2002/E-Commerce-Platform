package e_commerce.platform.modules.product.repository;

import e_commerce.platform.modules.product.entity.Product;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;


public interface ProductRepository extends 
JpaRepository<Product, Long>, 
JpaSpecificationExecutor<Product> {

@Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.deleted = false")
Page<Product> findAllWithCategory(Pageable pageable);

@EntityGraph(attributePaths = {"category"})
Page<Product> findAllByDeletedFalse(Pageable pageable);

Page<Product> findByDeletedFalse(Pageable pageable);

}