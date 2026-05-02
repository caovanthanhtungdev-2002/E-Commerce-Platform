
package e_commerce.platform.admin.dto.response;

import e_commerce.platform.modules.product.entity.ProductStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminProductResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private ProductStatus status;
    private String categoryName;
    private Double avgRating;
    private Long reviewCount;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}