package e_commerce.platform.modules.category.mapper;

import e_commerce.platform.modules.category.dto.response.CategoryResponse;
import e_commerce.platform.modules.category.entity.Category;

import java.util.List;

public class CategoryMapper {

    public static CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .children(
                    category.getChildren() != null
                        ? category.getChildren().stream()
                            .filter(c -> !Boolean.TRUE.equals(c.getDeleted()))
                            .map(CategoryMapper::toResponse)
                            .toList()
                        : List.of()
                )
                .build();
    }
}