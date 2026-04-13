package e_commerce.platform.modules.cart.model;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItem {

    private Long productId;
    private Integer quantity;
}