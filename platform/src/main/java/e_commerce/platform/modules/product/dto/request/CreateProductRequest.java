package e_commerce.platform.modules.product.dto.request;

import lombok.Data;

@Data
public class CreateProductRequest {
    private String name;
    private String description;
    private Double price;
    private Integer stock;
    private String imageUrl;
}