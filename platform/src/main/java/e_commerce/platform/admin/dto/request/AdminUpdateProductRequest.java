
package e_commerce.platform.admin.dto.request;

import e_commerce.platform.modules.product.entity.ProductStatus;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AdminUpdateProductRequest {

    private String name;

    private String description;

    @Positive
    private Double price;

    private String imageUrl;

    private ProductStatus status; 

    private Long categoryId;
}