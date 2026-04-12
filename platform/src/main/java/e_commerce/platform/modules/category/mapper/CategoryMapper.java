package e_commerce.platform.modules.category.mapper;

import e_commerce.platform.modules.category.dto.response.CategoryResponse;
import e_commerce.platform.modules.category.entity.Category;

public class CategoryMapper {

    public static CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .build();
    }
}

