
package e_commerce.platform.admin.dto.request;

import e_commerce.platform.modules.product.entity.ProductStatus;
import lombok.Data;

@Data
public class AdminProductFilterRequest {
    private String keyword;
    private Double minPrice;
    private Double maxPrice;
    private ProductStatus status;   
    private Long categoryId;
}