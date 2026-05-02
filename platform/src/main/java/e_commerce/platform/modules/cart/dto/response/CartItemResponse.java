package e_commerce.platform.modules.cart.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponse {

    private Long productId;
    private String productName;
    private Double price;
    private Integer quantity;
     private String imageUrl;
}