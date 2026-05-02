
package e_commerce.platform.admin.mapper;

import e_commerce.platform.admin.dto.response.AdminProductResponse;
import e_commerce.platform.modules.product.entity.Product;

public class AdminProductMapper {

    public static AdminProductResponse toResponse(Product product) {
        return AdminProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .status(product.getStatus())
                .categoryName(product.getCategory() != null
                        ? product.getCategory().getName() : null)
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .createdAt(product.getCreatedAt())
                .createdBy(product.getCreatedBy())
                .updatedAt(product.getUpdatedAt())
                .updatedBy(product.getUpdatedBy())
                .build();
    }
}