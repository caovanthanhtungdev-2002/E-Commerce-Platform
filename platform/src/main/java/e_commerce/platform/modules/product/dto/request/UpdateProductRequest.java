package e_commerce.platform.modules.product.dto.request;

import lombok.Data;

@Data
public class UpdateProductRequest {
    private String name;
    private String description;
    private Double price;
    private Integer stock;
    private String imageUrl;
    private Boolean active;
    private Long categoryId;
}