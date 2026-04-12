package e_commerce.platform.modules.category.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import e_commerce.platform.modules.category.entity.Category;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByName(String name);

    Optional<Category> findByName(String name);
}