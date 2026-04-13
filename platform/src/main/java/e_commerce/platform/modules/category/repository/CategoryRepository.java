package e_commerce.platform.modules.category.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import e_commerce.platform.modules.category.entity.Category;
import org.springframework.data.domain.*;
import java.util.Optional;



public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByNameIgnoreCase(String name);

    Optional<Category> findByName(String name);

    Page<Category> findByDeletedFalseAndIsActiveTrue(Pageable pageable);


}