package e_commerce.platform.modules.product.dto.request;

import lombok.Data;

@Data
public class ProductSearchRequest {
    private String keyword;
    private Double minPrice;
    private Double maxPrice;
    private Boolean active;
}