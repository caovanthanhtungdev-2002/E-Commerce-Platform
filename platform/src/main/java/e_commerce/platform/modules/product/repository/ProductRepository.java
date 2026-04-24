package e_commerce.platform.modules.product.repository;

import e_commerce.platform.modules.product.entity.Product;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductRepository extends 
JpaRepository<Product, Long>, 
JpaSpecificationExecutor<Product> {

@Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.deleted = false")
Page<Product> findAllWithCategory(Pageable pageable);

@EntityGraph(attributePaths = {"category"})
Page<Product> findAllByDeletedFalse(Pageable pageable);

Page<Product> findByDeletedFalse(Pageable pageable);

 Page<Product> findAll(Pageable pageable);

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByCategory_Id(Long categoryId);

}