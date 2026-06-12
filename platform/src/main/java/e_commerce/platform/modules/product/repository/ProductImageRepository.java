package e_commerce.platform.modules.product.repository;

import e_commerce.platform.modules.product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductIdOrderBySortOrderAsc(Long productId);
    void deleteByProductId(Long productId);
}