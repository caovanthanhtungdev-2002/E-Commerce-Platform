package e_commerce.platform.modules.inventory.entity;

import e_commerce.platform.modules.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    private Long productId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer stock;

    private Integer reserved; 

    private Integer sold;
}