
package e_commerce.platform.modules.product.mapper;

import e_commerce.platform.modules.product.dto.response.ProductResponse;
import e_commerce.platform.modules.product.entity.Product;

public class ProductMapper {

    public static ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .categoryName(product.getCategory() != null
                        ? product.getCategory().getName() : null)
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .build();
    }
}