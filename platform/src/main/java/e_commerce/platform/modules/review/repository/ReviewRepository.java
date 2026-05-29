package e_commerce.platform.modules.review.repository;

import e_commerce.platform.modules.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    Page<Review> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = :productId")
    Double getAverageRating(Long productId);

    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.productId = :productId")
    long countByProductId(@Param("productId") Long productId);
}