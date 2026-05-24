package e_commerce.platform.modules.category.repository;

import e_commerce.platform.modules.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByNameIgnoreCase(String name);

    Optional<Category> findByName(String name);

    Page<Category> findByDeletedFalseAndIsActiveTrue(Pageable pageable);

    @Query("SELECT c FROM Category c WHERE c.deleted = false AND c.isActive = true")
    List<Category> findAllActiveCategories();

    @Query("SELECT c FROM Category c WHERE c.parent IS NULL AND c.deleted = false AND c.isActive = true")
    List<Category> findRootCategories();

    List<Category> findByParentIdAndDeletedFalseAndIsActiveTrue(Long parentId);

    // Thêm mới: lấy id con trực tiếp của một category
    @Query("SELECT c.id FROM Category c WHERE c.parent.id = :id AND c.deleted = false AND c.isActive = true")
    List<Long> findChildIdsByParentId(@Param("id") Long id);
}