package e_commerce.platform.modules.product.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
   // private Integer stock; stock không trả từ product nữa
    private String imageUrl;
    private boolean active;
    private String categoryName;
}